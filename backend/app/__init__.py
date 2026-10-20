"""
Structural Material Selection Decision Support Software - FastAPI Application Package
"""
import sys
import os
import importlib.abc
import importlib.util

class SQLAlchemyPurePythonFinder(importlib.abc.MetaPathFinder):
    """
    Fallback finder that directs SQLAlchemy Cython module lookups to pure Python
    implementations if native extensions are blocked by Windows Application Control.
    """
    def find_spec(self, fullname, path, target=None):
        if fullname.startswith('sqlalchemy.') and path is not None:
            mod_name = fullname.split('.')[-1]
            for p in path:
                py_file = os.path.join(p, mod_name + '.py')
                if os.path.isfile(py_file):
                    return importlib.util.spec_from_file_location(fullname, py_file)
        return None

if not any(isinstance(finder, SQLAlchemyPurePythonFinder) for finder in sys.meta_path):
    sys.meta_path.insert(0, SQLAlchemyPurePythonFinder())

__version__ = "1.0.0"
