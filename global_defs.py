def contain_list(text: str, data: list) -> bool:
    """Checks to see if text is contained in any of the strings in the list.

    Args:
        text: String that might be in list.
        data: List of strings to check if in text. """
    for string in data:
        if string in text:
            return True
    return False
