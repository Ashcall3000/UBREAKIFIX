import pyprint


def read_number(prompt="Please Enter a Number: ", max=10, min=0, side='|', sep=' ', delimiter=' ', width=80):
    """Prompts user for input and will only except an integer that fits within the max and min range given.
    Then returns the given input.

    Args:
        prompt: Texts that is prompted to user. DEFAULT: 'Please Enter a Number: '
        max: The highest integer that will be accepted. DEFAULT: 10
        min: The lowest integer that will be accepted. DEFAULT: 0
        side: Character used to print as the border. DEFAULT: |
        sep: Character used to separate the text and the side. DEFAULT: ' '
        delimiter: Character used to fill the empty space or white space. DEFAULT: ' '
        width: DEFAULT: 80"""
    # Loop until Correct Input is given
    while True:
        pyprint.__prompt(prompt, side, sep, delimiter, width)
        user_input = input("")
        # If user input is an integer
        try:
            user_input = int(user_input)
            if user_input > max:
                pyprint.write("Please enter a number less than", max, side=side, sep=sep,
                              delimiter=delimiter, width=width)
            elif user_input < min:
                pyprint.write("Please enter a number larger than", min, side=side, sep=sep,
                              delimiter=delimiter, width=width)
            else:
                # Number is between min and max so stop the loop
                break
        # If user input is not an integer
        except ValueError:
            pyprint.write(user_input, "is not an integer.")
    return user_input


def read_string(prompt="Please Enter a String: ", max=20, min=1, side='|', sep=' ', delimiter=' ', width=80):
    """Prompts user for string and only accepts a string within a certain length.
    Then returns the users text.

    Args:
        prompt: Text that is prompted to user. DEFAULT: 'Please Enter a String: '
        max: Maximum length text length. DEFAULT: 20
        min: Minimum length text length. DEFAULT: 1
        side: Character used to print as the border. DEFAULT: |
        sep: Character used to separate the text and the side. DEFAULT: ' '
        delimiter: Character used to fill the empty space or white space. DEFAULT: ' '
        width: DEFAULT: 80"""
    # Loop until correct input is given
    while True:
        pyprint.__prompt(prompt, side, sep, delimiter, width)
        user_input = input("")
        # If string is longer than max
        if len(user_input) > max:
            pyprint.write("Input is to long. Please enter less than", max, "characters.", side=side, sep=sep, delimiter=delimiter, width=width)
        elif len(user_input) < min:
            pyprint.write("Input is to short. Please enter more than", min, "characters.", side=side, sep=sep, delimiter=delimiter, width=width)
        # If string is smaller or equal to max in length
        else:
            break
    return user_input


def read_character(prompt="Please Enter a Character: ", chars="", side='|', sep=' ', delimiter=' ', width=80):
    """Prompts user for a character and by defaults will accept any character but can be given
    a list of characters that will be accepted. Then returns the user input.

    Args:
        prompt: Text that is prompted to user. DEFAULT: 'Please Enter a Character: '
        chars: Characters that will be accepted. DEFAULT: ''
        side: Character used to print as the border. DEFAULT: |
        sep: Character used to separate the text and the side. DEFAULT: ' '
        delimiter: Character used to fill the empty space or white space. DEFAULT: ' '
        width: DEFAULT: 80"""
    user_input = read_string(prompt, 1, 1, side, sep, delimiter, width)
    if not chars:
        while user_input not in chars:
            user_input = read_string(prompt, 1, 1, side, sep, delimiter, width)
    return user_input
