import requests
import os
import datetime
import time
import json
import re

# 设置脚本所在目录为工作目录
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# 读取目录下的url.json文件
with open('url.json', 'r', encoding='utf-8') as f:
    url_list = json.load(f)

def modify(response):
    pattern1 = rb"\*:\/\/\*(?=[a-zA-Z0-9_-]+\.)"
    pattern2 = rb"(?<=\sdocument-)body"
    pattern3 = rb"(?<=\.[a-zA-Z]+)\*"
    mid = re.sub(pattern1, rb"*://*.", response.content)
    mid2 = re.sub(pattern1, rb"/*", mid)
    new_content = re.sub(pattern2, rb"end", mid2)
    return new_content


# 遍历url_list，下载"url"对应的文件到js目录下
for url in url_list['down']:
    r = requests.get(url['url'])
    o = modify(r)
    with open('js/' + url['name'] + 'user.js', 'wb') as f:
        f.write(o)
