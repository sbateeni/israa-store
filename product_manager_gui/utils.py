import os
import re
import shutil
from tkinter import messagebox

# احصل على مسار مجلد product_manager_gui بغض النظر عن مكان التشغيل
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTS_FILE = os.path.join(BASE_DIR, "src", "lib", "products.ts")
MEDIA_DIR = os.path.join(BASE_DIR, "public", "products")

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
            products_str += f'    {k}: "{v}",\n'
        products_str = products_str.rstrip(",\n") + "\n  }),\n"
    products_str = products_str.rstrip(",\n") + "\n];"
    with open(PRODUCTS_FILE, "w", encoding="utf-8") as f:
        f.write(before + products_str + after)

def copy_media(file_path):
    if not os.path.exists(MEDIA_DIR):
        os.makedirs(MEDIA_DIR)
    filename = os.path.basename(file_path)
    dest = os.path.join(MEDIA_DIR, filename)
    shutil.copy2(file_path, dest)
    return f"/products/{filename}" 