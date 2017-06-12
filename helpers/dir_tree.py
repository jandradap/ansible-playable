import os
import json

def path_to_dict(path):
    d = {'name': os.path.basename(path),'path': os.path.abspath(path)}
    if os.path.isdir(path):
        d['type'] = "directory"
        d['children'] = [path_to_dict(os.path.join(path,x)) for x in os.listdir\
(path)]
    else:
        d['type'] = "file"
        filename, d['extension'] = os.path.splitext(path)
    return d

print json.dumps(path_to_dict('.'))
