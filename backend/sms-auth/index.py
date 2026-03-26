import os
import json
import random
import time
import hashlib
import urllib.request
import urllib.parse

def jdump(data):
    return json.dumps(data, ensure_ascii=False)

# Хранение кодов в памяти: phone -> {code, expires}
_codes: dict = {}

def send_sms(phone: str, message: str) -> bool:
    """Отправляет SMS через SMSC.ru"""
    login = os.environ.get("SMSC_LOGIN", "")
    password = os.environ.get("SMSC_PASSWORD", "")
    if not login or not password:
        return False
    params = urllib.parse.urlencode({
        "login": login,
        "psw": password,
        "phones": phone,
        "mes": message,
        "fmt": 3,
        "charset": "utf-8",
    })
    url = f"https://smsc.ru/sys/send.php?{params}"
    req = urllib.request.urlopen(url, timeout=10)
    resp = json.loads(req.read().decode())
    return "error" not in resp

def handler(event: dict, context) -> dict:
    """Авторизация через SMS: отправка и проверка кода"""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    try:
        body = json.loads(event.get("body") or "{}")
    except Exception:
        body = {}

    action = body.get("action")
    phone = (body.get("phone") or "").replace(" ", "").replace("-", "").replace("(", "").replace(")", "")

    if not phone or not phone.startswith("+7") or len(phone) != 12:
        return {
            "statusCode": 400,
            "headers": cors,
            "body": jdump({"error": "Некорректный номер телефона"}),
        }

    now = int(time.time())

    if action == "send":
        code = str(random.randint(1000, 9999))
        _codes[phone] = {"code": code, "expires": now + 300}

        message = f"Ваш код для входа в Такси с нами: {code}"
        sent = send_sms(phone, message)

        if not sent:
            return {
                "statusCode": 500,
                "headers": cors,
                "body": json.dumps({"error": "Не удалось отправить SMS. Проверьте настройки SMSC."}),
            }

        return {
            "statusCode": 200,
            "headers": cors,
            "body": json.dumps({"ok": True, "message": "Код отправлен"}),
        }

    if action == "verify":
        entered = body.get("code", "")
        record = _codes.get(phone)

        if not record:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Сначала запросите код"})}
        if now > record["expires"]:
            _codes.pop(phone, None)
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Код истёк. Запросите новый"})}
        if entered != record["code"]:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Неверный код"})}

        _codes.pop(phone, None)
        token = hashlib.sha256(f"{phone}{now}".encode()).hexdigest()

        return {
            "statusCode": 200,
            "headers": cors,
            "body": json.dumps({"ok": True, "token": token}),
        }

    return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Неизвестное действие"})}