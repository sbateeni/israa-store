import os
import re
import shutil
from tkinter import messagebox

# احصل على مسار مجلد product_manager_gui بغض النظر عن مكان التشغيل
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTS_FILE = os.path.join(BASE_DIR, "src", "lib", "products.ts")
MEDIA_DIR = os.path.join(BASE_DIR, "public", "products")
ADS_FILE = os.path.join(BASE_DIR, "src", "lib", "ads.ts")
SOCIALS_FILE = os.path.join(BASE_DIR, "src", "lib", "socials.ts")

def read_products():
    with open(PRODUCTS_FILE, "r", encoding="utf-8") as f:
        content = f.read()
    pattern = r"withDefaultSocials\(\s*{([^}]+)}\s*\)"
    matches = re.findall(pattern, content, re.DOTALL)
    products = []
    for match in matches:
        prod = {}
        for line in match.splitlines():
            line = line.strip().rstrip(",")
            if not line or ":" not in line:
                continue
            key, value = line.split(":", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            prod[key] = value
        products.append(prod)
    return products

def write_products(products):
    with open(PRODUCTS_FILE, "r", encoding="utf-8") as f:
        content = f.read()
    start = content.find("export const products: Product[] = [")
    end = content.find("];", start)
    if start == -1 or end == -1:
        messagebox.showerror("خطأ", "لم يتم العثور على مصفوفة المنتجات في الملف.")
        return
    before = content[:start]
    after = content[end+2:]
    products_str = "export const products: Product[] = [\n"
    for prod in products:
        products_str += "  withDefaultSocials({\n"
        for k, v in prod.items():
            if k == "images" and v.startswith("[") and v.endswith("]"):
                products_str += f'    {k}: {v},\n'
            else:
                products_str += f'    {k}: "{v}",\n'
        products_str = products_str.rstrip(",\n") + "\n  }),\n"
    products_str = products_str.rstrip(",\n") + "\n];"
    with open(PRODUCTS_FILE, "w", encoding="utf-8") as f:
        f.write(before + products_str + after)

def copy_media(file_path):
    if not os.path.exists(MEDIA_DIR):
        os.makedirs(MEDIA_DIR)
    filename = os.path.basename(file_path)
    name, ext = os.path.splitext(filename)
    dest = os.path.join(MEDIA_DIR, filename)
    counter = 1
    # إذا كان الملف موجودًا، أضف رقمًا تسلسليًا للاسم
    while os.path.exists(dest):
        filename = f"{name}_{counter}{ext}"
        dest = os.path.join(MEDIA_DIR, filename)
        counter += 1
    shutil.copy2(file_path, dest)
    return f"/products/{filename}"

def read_ads():
    if not os.path.exists(ADS_FILE):
        return []
    with open(ADS_FILE, "r", encoding="utf-8") as f:
        content = f.read()
    pattern = r"export const ads = \[(.*?)\];"  # يلتقط كل الدعايات
    import re
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        return []
    ads_str = match.group(1)
    ads = []
    for ad_block in re.findall(r"{(.*?)}", ads_str, re.DOTALL):
        ad = {}
        for line in ad_block.splitlines():
            line = line.strip().rstrip(",")
            if not line or ":" not in line:
                continue
            key, value = line.split(":", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            ad[key] = value
        if ad:
            ads.append(ad)
    return ads

def write_ads(ads):
    ads_str = "export const ads = [\n"
    for ad in ads:
        ads_str += "  {\n"
        for k, v in ad.items():
            ads_str += f'    {k}: "{v}",\n'
        ads_str = ads_str.rstrip(",\n") + "\n  },\n"
    ads_str = ads_str.rstrip(",\n") + "\n];"
    with open(ADS_FILE, "w", encoding="utf-8") as f:
        f.write(ads_str)

def read_socials():
    if not os.path.exists(SOCIALS_FILE):
        return {
            "facebook": "",
            "instagram": "",
            "snapchat": "",
            "whatsapp": "",
            "tiktok": ""
        }
    with open(SOCIALS_FILE, "r", encoding="utf-8") as f:
        content = f.read()
    import re
    pattern = r"export const socials = {(.*?)};"
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        return {
            "facebook": "",
            "instagram": "",
            "snapchat": "",
            "whatsapp": "",
            "tiktok": ""
        }
    socials_str = match.group(1)
    socials = {}
    for line in socials_str.splitlines():
        line = line.strip().rstrip(",")
        if not line or ":" not in line:
            continue
        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        socials[key] = value
    if "tiktok" not in socials:
        socials["tiktok"] = ""
    return socials

def write_socials(socials):
    socials_str = "export const socials = [\n"
    for k, v in socials.items():
        socials_str += f'  {k}: "{v}",\n'
    socials_str = socials_str.rstrip(",\n") + "\n};"
    with open(SOCIALS_FILE, "w", encoding="utf-8") as f:
        f.write(socials_str) 