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
    pattern1 = rb"\*://\*[a-zA-Z]+\."
    pattern2 = rb"@run-at\s+document-body"
    mid_content = re.sub(pattern1, rb"*://*.\g<1>.", response.content)
    new_content = re.sub(pattern, rb"@run-at\g<1>document-end", mid_content)
    return new_content


# 遍历url_list，下载"url"对应的文件到js目录下
for url in url_list['down']:
    r = requests.get(url['url'])
    f = modify(r)
    with open('js/' + url['name'] + 'user.js', 'wb') as f:
        f.write(f)
