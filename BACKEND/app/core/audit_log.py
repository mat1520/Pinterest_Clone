import logging
import sys

audit_logger = logging.getLogger("audit")
audit_logger.setLevel(logging.INFO)

_handler = logging.StreamHandler(sys.stdout)
_handler.setFormatter(
    logging.Formatter('{"time": "%(asctime)s", "level": "%(levelname)s", "event": %(message)s}')
)
audit_logger.addHandler(_handler)


def log_login_success(user_id: int, correo: str) -> None:
    audit_logger.info(f'{{"action": "login_success", "user_id": {user_id}, "correo": "{correo}"}}')


def log_login_failure(correo: str) -> None:
    audit_logger.warning(f'{{"action": "login_failure", "correo": "{correo}"}}')


def log_token_invalid(detail: str) -> None:
    audit_logger.warning(f'{{"action": "token_invalid", "detail": "{detail}"}}')


def log_delete_pin(user_id: int, pin_id: int, is_admin: bool) -> None:
    audit_logger.info(
        f'{{"action": "delete_pin", "user_id": {user_id}, "pin_id": {pin_id}, "is_admin": {str(is_admin).lower()}}}'
    )


def log_unauthorized_delete_attempt(user_id: int, pin_id: int) -> None:
    audit_logger.warning(
        f'{{"action": "unauthorized_delete_attempt", "user_id": {user_id}, "pin_id": {pin_id}}}'
    )


def log_upload_blocked(reason: str) -> None:
    audit_logger.warning(f'{{"action": "upload_blocked", "reason": "{reason}"}}')
