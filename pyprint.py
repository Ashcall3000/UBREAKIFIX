from sys import stdout

"""Pywrite is a writes to command line in format that is more like a menu."""


def topline(title="", top='=', width=80):
    """topline repeats the character top across the width. Will
    put a title in the middle of the top line.

    Args:
        title: Text that is in the middle of the page.
        top: A character that is used to fill the length of the width DEFAULT: =
        width: width the top line prints too. DEFAULT: 80"""
    if not title:
        for i in range(width):
            stdout.write(top)
    else:
        length = int((width - len(title)) / 2)
        mod = len(title) % 2
        for i in range(length + mod):
            stdout.write(top)
        stdout.write(title)
        for i in range(length):
            stdout.write(top)
    stdout.write('\n')


def warning(*messages, **kwargs):
    """writes out a warning message to the user. If the text fits in only a single line of the width
    will print out centered unless the message doesn't fit in a single line.

    Args:
        messages: is an array of text which is the body of the message of the warning.
        warn: Word that will be put as the title of message. DEFAULT: WARNING
        side: Character use to put on the sides of the body of text. DEFAULT: |
        delimiter: Character used to fill the empty space or white space. DEFAULT: ' '
        warn_fill: Character used for the top and bottom lines. DEFAULT: #
        width: Width length of the menu printed out. DEFAULT: 80"""
    warn = kwargs.pop('warn', "WARNING")
    side = kwargs.pop('side', '|')
    delimiter = kwargs.pop('delimiter', ' ')
    warn_fill = kwargs.pop('warn_fill', '#')
    width = kwargs.pop('width', 80)
    message = ""
    for line in list(messages):
        message += str(line) + delimiter
    midline(warn, side=side, mid=warn_fill, width=width)
    center(message)
    stdout.write(side)
    for i in range(width - 2):
        stdout.write(warn_fill)
    print(side)


def note(*messages, **kwargs):
    """Writes out a note message to the user. If the text fits in only a single line then will print out
    centered.

    Args:
        messages: Is an array of text which is the body of the message of the note.
        note_title: Word that will be put as the title of the message. DEFAULT: NOTE
        side: Character used to put on the sides of the body of text. DEFAULT: |
        sep: Character use to fill the empty space or white space. DEFAULT ' '
        delimiter: Character used to fill in the sides if text is centered. DEFUALT: ' '
        note_fill: Character used to fill the top and bottom lines. DEFAULT: *
        width: Width length of the menu printed out. DEFAULT: 80"""
    note_title = kwargs.pop('note_title', 'NOTE')
    side = kwargs.pop('side', '|')
    sep = kwargs.pop('sep', ' ')
    delimiter = kwargs.pop('delimiter', ' ')
    note_fill = kwargs.pop('note_fill', '*')
    width = kwargs.pop('width', 80)
    message = ""
    for line in list(messages):
        message += str(line) + delimiter
    midline(note_title, side, note_fill, width)
    center(message, side=side, sep=sep, delimiter=delimiter, width=width)
    midline()


def bottomline(title="", bottom='-', width=80):
    """Writes a bottom line can be a title at the bottom line with text in the middle.

    Args:
        title: String that will be used to as the title. DEFAULT: empty
        bottom: Character used to print across the screen. DEFAULT: -
        width: Number of characters across. DEFAULT: 80"""
    if len(title) is 0:
        for i in range(width):
            stdout.write(bottom)
    else:
        length = int((width - len(title)) / 2)
        mod = len(title) % 2
        for i in range(length + mod):
            stdout.write(bottom)
        stdout.write(title)
        for i in range(length):
            stdout.write(bottom)
    stdout.write('\n')


def midline(title="", side='|', mid='*', width=80):
    """Writes a middle line can be a title at the bottom line with text in the middle.

        Args:
            title: String that will be used to as the title. DEFAULT: empty
            side: Character used to print on the borders. DEFAULT: |
            mid: Character used to print across the screen. DEFAULT: -
            width: Number of characters across. DEFAULT: 80"""
    stdout.write(side)
    title = str(title)
    if len(title) is 0:
        for i in range(width - 2):
            stdout.write(mid)
    else:
        length = int((width - len(title) - 2) / 2)
        mod = len(title) % 2
        for i in range(length + mod):
            stdout.write(mid)
        stdout.write(title)
        for i in range(length):
            stdout.write(mid)
    print(side)


def center(*messages, **kwargs):
    """Write text in the center of the screen unless it's too long.

    Args:
        side: Character printed as the boarder. DEFAULT: |
        sep: Character used to separate the text and the side. DEFAULT: ' '
        delimiter: Character used to fill the empty space or white space. DEFAULT: ' '
        width: Width length of the menu printed out. DEFAULT: 80"""
    side = kwargs.pop('side', '|')
    sep = kwargs.pop('sep', ' ')
    delimiter = kwargs.pop('delimiter', ' ')
    width = kwargs.pop('width', 80)
    mid_width = width - 4
    string = ""
    for line in list(messages):
        string += str(line) + sep
    if len(string) >= mid_width:
        write(string, side=side, sep=sep, delimiter=delimiter, width=width)
    else:
        stdout.write(side + delimiter)
        length = int((mid_width - len(string)) / 2)
        mod = len(string) % 2
        for i in range(length + mod):
            stdout.write(delimiter)
        stdout.write(string)
        for i in range(length):
            stdout.write(delimiter)
        print(delimiter + side)


def write(*messages, **kwargs):
    """Writes text to the screen and keeps the text with in a given width and then puts
    a border on the sides of the text.

    Args:
        side: Character printed as the boarder. DEFAULT: |
        sep: Character used to separate the text and the side. DEFAULT: ' '
        delimiter: Character used to fill the empty space or white space. DEFAULT: ' '
        width: Width length of the menu printed out. DEFAULT: 80"""
    side = kwargs.pop('side', '|')
    sep = kwargs.pop('sep', ' ')
    delimiter = kwargs.pop('delimiter', ' ')
    width = kwargs.pop('width', 80)
    mid_width = width - 4
    string = ""
    for line in list(messages):
        string += str(line) + sep
    #string = Strings(string)
    length = 0
    stdout.write(side + delimiter)
    for word in string.split(delimiter):
        length += len(word)
        if length < mid_width:
            try:
                stdout.write(word)
            except:
                for i in range(len(word)):
                    try:
                        stdout.write(word[i])
                    except:
                        stdout.write(' ')
        else:
            length -= len(word)
            for i in range(length, mid_width):
                stdout.write(delimiter)
                length += 1
        if length is mid_width:
            stdout.write(delimiter + side + '\n')
            stdout.write(side + delimiter)
            try:
                stdout.write(word)
            except:
                if i in range(len(word)):
                    try:
                        stdout.write(word[i])
                    except:
                        stdout.write(' ')
            stdout.write(delimiter)
            if len(word) > mid_width:
                length = mid_width
            else:
                length = len(word) + 1
        else:
            stdout.write(delimiter)
            length += 1
    if length < mid_width:
        for i in range(length, mid_width):
            stdout.write(delimiter)
            length += 1
    stdout.write(delimiter + side)
    stdout.write('\n')


def __prompt(prompt="", side='|', sep=' ', delimiter=' ', width=80):
    mid_width = width - 4
    length = 0
    stdout.write(side + delimiter)
    for word in prompt.split(delimiter):
        length += len(word)
        if length < mid_width:
            stdout.write(word)
        else:
            length -= len(word)
            for i in range(length, mid_width):
                stdout.write(delimiter)
                length += 1
        if length is mid_width:
            stdout.write(delimiter + side + '\n')
            stdout.write(side + delimiter)
            length = 0
        else:
            stdout.write(delimiter)
            length += 1


def strings(string):
    return string.encode('utf-8')
