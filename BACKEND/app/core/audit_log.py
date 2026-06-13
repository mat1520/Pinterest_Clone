import json
import logging
import sys

audit_logger = logging.getLogger("audit")
audit_logger.setLevel(logging.INFO)
audit_logger.propagate = False

_handler = logging.StreamHandler(sys.stdout)
_handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
audit_logger.addHandler(_handler)


def _emit(record: dict) -> None:
    audit_logger.info(json.dumps(record, ensure_ascii=False))


def log_login_success(user_id: int, correo: str) -> None:
    masked = correo[:3] + "***" + correo[correo.find("@"):]
    _emit({"action": "login_success", "user_id": user_id, "correo": masked})


def log_login_failure(correo: str) -> None:
    masked = correo[:3] + "***" + correo[correo.find("@"):]
    _emit({"action": "login_failure", "correo": masked})


def log_token_invalid(detail: str) -> None:
    _emit({"action": "token_invalid", "detail": detail})


def log_delete_pin(user_id: int, pin_id: int, is_admin: bool) -> None:
    _emit({"action": "delete_pin", "user_id": user_id, "pin_id": pin_id, "is_admin": is_admin})


def log_unauthorized_delete_attempt(user_id: int, pin_id: int) -> None:
    _emit({"action": "unauthorized_delete_attempt", "user_id": user_id, "pin_id": pin_id})


def log_upload_blocked(reason: str) -> None:
    _emit({"action": "upload_blocked", "reason": reason})
