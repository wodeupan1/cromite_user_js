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

# 遍历url_list，下载"url"对应的文件到js目录下
for url in url_list:
    r = requests.get(url['url'])
    with open('js/' + url['name'], 'wb') as f:
        f.write(r.content)
            except:
                pass
