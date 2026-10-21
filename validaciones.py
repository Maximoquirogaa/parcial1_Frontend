LONGITUD_MINIMA = 8
LONGITUD_MAXIMA = 32


def validar_contrasenia(password: str) -> bool:
    """Valida que una contraseña cumpla con los criterios de seguridad establecidos.

    Args:
        password: La contraseña a evaluar.

    Returns:
        True si la contraseña cumple con todos los criterios de seguridad.

    Raises:
        TypeError: Si el valor ingresado no es una cadena de texto.
        ValueError: Si la contraseña es demasiado corta, demasiado larga,
            contiene espacios en blanco, no incluye al menos un dígito
            numérico o no incluye al menos una letra mayúscula.
    """
    if not isinstance(password, str):
        raise TypeError("El valor ingresado debe ser una cadena de texto")

    if len(password) < LONGITUD_MINIMA:
        raise ValueError("La contraseña es demasiado corta: debe tener al menos 8 caracteres")

    if len(password) > LONGITUD_MAXIMA:
        raise ValueError("La contraseña es demasiado larga: no debe superar los 32 caracteres")

    if " " in password:
        raise ValueError("La contraseña no debe contener espacios en blanco")

    if not any(caracter.isdigit() for caracter in password):
        raise ValueError("La contraseña debe incluir al menos un número")

    if not any(caracter.isupper() for caracter in password):
        raise ValueError("La contraseña debe incluir al menos una letra mayúscula")

    return True
