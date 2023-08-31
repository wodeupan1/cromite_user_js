import requests
import os
import datetime
import time
import json

# 设置脚本所在目录为工作目录
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# 读取目录下的url.json文件
with open('url.json', 'r', encoding='utf-8') as f:
    url_list = json.load(f)

def modify_run_at(response):
    # response is a requests response object
    # check if the response content contains "@run-at document-body"
    if b"@run-at       document-start" in response.content:
        # replace it with "@run-at document-end"
        new_content = response.content.replace(b"@run-at document-body", b"@run-at document-end")
        # return the modified content
        return new_content
    else:
        # skip the modification
        return response.content


# 遍历url_list，下载"url"对应的文件到js目录下
for url in url_list['down']:
    r = requests.get(url['url'])
    f = modify_run_at(r)
    with open('js/' + url['name'] + 'user.js', 'wb') as f:
        f.write(f)
