import os
import json
import shutil
from tkinter import *
from tkinter import filedialog, messagebox, ttk

# إعداد المسارات
PRODUCTS_JSON = os.path.join('src', 'lib', 'products.json')
IMAGES_DIR = os.path.join('public', 'products')

# التأكد من وجود مجلد الصور
os.makedirs(IMAGES_DIR, exist_ok=True)

# تحميل المنتجات من ملف JSON
if os.path.exists(PRODUCTS_JSON):
    with open(PRODUCTS_JSON, 'r', encoding='utf-8') as f:
        try:
            products = json.load(f)
        except json.JSONDecodeError:
            products = []
else:
    products = []

def save_products():
    with open(PRODUCTS_JSON, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

def add_product():
    name = name_var.get().strip()
    desc = desc_var.get().strip()
    price = price_var.get().strip()
    category = category_var.get().strip()
    image_path = image_var.get().strip()

    if not (name and desc and price and category and image_path):
        messagebox.showerror('خطأ', 'يرجى تعبئة جميع الحقول')
        return
    try:
        price_val = float(price)
    except ValueError:
        messagebox.showerror('خطأ', 'السعر يجب أن يكون رقمًا')
        return

    # نسخ الصورة إلى مجلد الصور
    img_filename = os.path.basename(image_path)
    dest_path = os.path.join(IMAGES_DIR, img_filename)
    try:
        shutil.copy(image_path, dest_path)
    except Exception as e:
        messagebox.showerror('خطأ', f'فشل نسخ الصورة: {e}')
        return
    rel_img_path = f'products/{img_filename}'

    # توليد id جديد
    new_id = max([p['id'] for p in products], default=0) + 1
    product = {
        'id': new_id,
        'name': name,
        'description': desc,
        'price': price_val,
        'category': category,
        'image': rel_img_path
    }
    products.append(product)
    save_products()
    update_product_list()
    clear_fields()
    messagebox.showinfo('تم', 'تمت إضافة المنتج بنجاح')

def delete_product():
    selected = product_list.selection()
    if not selected:
        return
    idx = int(selected[0])
    prod = products[idx]
    if messagebox.askyesno('تأكيد', f'هل أنت متأكد من حذف المنتج: {prod["name"]}?'):
        # حذف الصورة من المجلد (اختياري)
        img_path = os.path.join("public", prod['image'])
        if os.path.exists(img_path):
            try:
                os.remove(img_path)
            except Exception:
                pass
        products.pop(idx)
        save_products()
        update_product_list()
        clear_fields()

def update_product_list():
    product_list.delete(*product_list.get_children())
    for idx, prod in enumerate(products):
        product_list.insert('', 'end', iid=idx, values=(prod['id'], prod['name'], prod['category'], prod['price']))

def clear_fields():
    name_var.set('')
    desc_var.set('')
    price_var.set('')
    category_var.set('')
    image_var.set('')

def select_image():
    path = filedialog.askopenfilename(filetypes=[('Images', '*.png;*.jpg;*.jpeg;*.webp;*.gif')])
    if path:
        image_var.set(path)

def on_product_select(event):
    selected = product_list.selection()
    if not selected:
        return
    idx = int(selected[0])
    prod = products[idx]
    name_var.set(prod['name'])
    desc_var.set(prod['description'])
    price_var.set(str(prod['price']))
    category_var.set(prod['category'])
    image_var.set(os.path.join(IMAGES_DIR, os.path.basename(prod['image'])))

def reload_products():
    global products
    if os.path.exists(PRODUCTS_JSON):
        with open(PRODUCTS_JSON, 'r', encoding='utf-8') as f:
            try:
                products = json.load(f)
            except json.JSONDecodeError:
                products = []
    else:
        products = []
    update_product_list()
    clear_fields()

# إعداد نافذة Tkinter
root = Tk()
root.title('لوحة تحكم المنتجات')
root.geometry('700x500')

# المتغيرات
name_var = StringVar()
desc_var = StringVar()
price_var = StringVar()
category_var = StringVar()
image_var = StringVar()

# النموذج
frm = Frame(root)
frm.pack(pady=10)

Label(frm, text='اسم المنتج:').grid(row=0, column=0, sticky=E)
Entry(frm, textvariable=name_var, width=30).grid(row=0, column=1)
Label(frm, text='الوصف:').grid(row=1, column=0, sticky=E)
Entry(frm, textvariable=desc_var, width=30).grid(row=1, column=1)
Label(frm, text='السعر:').grid(row=2, column=0, sticky=E)
Entry(frm, textvariable=price_var, width=30).grid(row=2, column=1)
Label(frm, text='التصنيف:').grid(row=3, column=0, sticky=E)
Entry(frm, textvariable=category_var, width=30).grid(row=3, column=1)
Label(frm, text='الصورة:').grid(row=4, column=0, sticky=E)
Entry(frm, textvariable=image_var, width=30).grid(row=4, column=1)
Button(frm, text='اختيار صورة', command=select_image).grid(row=4, column=2)

Button(frm, text='إضافة منتج', command=add_product, bg='#4caf50', fg='white').grid(row=5, column=1, pady=10)
Button(frm, text='حذف المنتج المحدد', command=delete_product, bg='#f44336', fg='white').grid(row=5, column=2, pady=10)
Button(frm, text='تحديث القائمة', command=reload_products, bg='#2196f3', fg='white').grid(row=5, column=0, pady=10)

# قائمة المنتجات
cols = ('ID', 'الاسم', 'التصنيف', 'السعر')
product_list = ttk.Treeview(root, columns=cols, show='headings', height=10)
for c in cols:
    product_list.heading(c, text=c)
    product_list.column(c, width=100)
product_list.pack(fill=X, padx=10, pady=10)
product_list.bind('<<TreeviewSelect>>', on_product_select)

update_product_list()

root.mainloop() 