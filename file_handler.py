from os import getcwd
from os import remove
from os.path import isfile
from pyprint import warning
from pyprint import write


def get_base_location():
    """Returns the current working directory."""
    return getcwd()


class FileHandle(object):
    """A class that Creates, Reads, Writes, and Deletes text files.

    Attributes:
        filename: Filename to create without extension.
        ext: The type of text file being created. Will Default to ini
        location: The location on HDD to look ie C://... Will Default to location where program is running."""

    def __init__(self, filename, ext="ini", location=get_base_location()):
        self.filename = filename
        self.ext = ext
        self.location = location

    def get_full_path(self) -> str:
        """Returns a string of the full path and filename with extension as a string."""
        return self.location + "\\" + self.filename + "." + self.ext

    def created(self) -> bool:
        """Returns if the file exists or not."""
        return isfile(self.get_full_path())

    def create(self, filename="", ext="ini", location=""):
        """Tries to create the file and the returns if the file has been created or not.
        if Attributes are given it will open or try to create a new file

        Attributes:
            filename: Filename to create without extension.
            ext: The type of text file being created. Will Default to ini
            location: The location on HDD to look ie C://... Will Default to location where program is running."""
        if filename:
            self.filename = filename
            self.ext = ext
            self.location = location
        try:
            write("Creating File...")
            self.doc = open(self.get_full_path(), "w+")
            self.doc.close()
            return True
        except OSError:
            warning("Could not open: ", self.get_full_path())
            return False

    def read(self) -> list:
        """Reads text from the file and returns array of strings. If unable to open file will print to user
        and return None"""
        if self.created():
            try:
                write("Reading File...")
                lines = []
                self.doc = open(self.get_full_path(), 'r')
                for line in self.doc:
                    lines.append(line.split('\n')[0])
                self.doc.close()
                return lines
            except OSError:
                warning("Could not find or open ", self.get_full_path())
        return []

    def write(self, *messages) -> bool:
        """Opens and writes given data to the file as text. Will print to the user if were unable to write to the
        file and return if we were able to write to file.

        Args:
            messages: Takes in multiple objects and strings."""
        if not self.created() and self.doc.closed:
            try:
                write("Saving File...")
                self.doc = open(self.get_full_path(), 'w')
                for line in list(messages):
                    self.doc.write(line)
                self.doc.close()
                return True
            except OSError:
                warning("Could not find or open file ", self.get_full_path())
        return False

    def delete(self):
        """Deletes the file and returns if it was able to delete the file."""
        if not self.created() and self.doc.closed:
            try:
                write("Deleting File...")
                remove(self.get_full_path())
                return True
            except OSError:
                warning("Unable to Delete file: ", self.get_full_path())
        return False

    def read_to_data(self, delimiter='=') -> dict:
        """Will read the data and the put it into key value pairs using
        the given delimiter to separate the text.

        Args:
            delimiter: Character used to separate the Key Value Pair. DEFAULT: ="""
        strings = self.read()
        if strings:
            data = []
            for s in strings:
                data.append(s.split(delimiter))
            key_value = {}
            for d in data:
                key_value[d[0]] = d[1]
            return key_value
        return {}
