import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import os
from utils import read_products, write_products, copy_media

CATEGORIES = ['Perfumes', 'Apparel', 'Creams']

class ProductManagerApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("إدارة المنتجات")
        self.geometry("900x600")
        self.products = []
        self.selected_media_path = None
        self.create_widgets()
        self.refresh_products()

    def create_widgets(self):
        # قائمة المنتجات
        self.tree = ttk.Treeview(self, columns=("id", "name", "price", "category", "image"), show="headings")
        for col in ("id", "name", "price", "category", "image"):
            self.tree.heading(col, text=col)
            self.tree.column(col, width=120)
        self.tree.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # أزرار
        btn_frame = tk.Frame(self)
        btn_frame.pack(fill=tk.X, padx=10)
        tk.Button(btn_frame, text="تحديث", command=self.refresh_products).pack(side=tk.LEFT, padx=5)
        tk.Button(btn_frame, text="حذف المنتج المحدد", command=self.delete_selected).pack(side=tk.LEFT, padx=5)

        # نموذج إضافة منتج
        form = tk.LabelFrame(self, text="إضافة منتج جديد")
        form.pack(fill=tk.X, padx=10, pady=10)
        self.inputs = {}
        fields = [
            ("name", "اسم المنتج"),
            ("description", "الوصف"),
            ("price", "السعر")
        ]
        for i, (key, label) in enumerate(fields):
            tk.Label(form, text=label).grid(row=i, column=0, sticky=tk.W, pady=2)
            entry = tk.Entry(form, width=50)
            entry.grid(row=i, column=1, pady=2)
            self.inputs[key] = entry
        # category كقائمة منسدلة
        tk.Label(form, text="الفئة").grid(row=len(fields), column=0, sticky=tk.W, pady=2)
        self.category_var = tk.StringVar()
        self.category_var.set(CATEGORIES[0])
        category_menu = ttk.Combobox(form, textvariable=self.category_var, values=CATEGORIES, state="readonly", width=47)
        category_menu.grid(row=len(fields), column=1, pady=2)
        # اختيار الوسائط
        tk.Label(form, text="الصورة/الفيديو").grid(row=len(fields)+1, column=0, sticky=tk.W, pady=2)
        self.media_label = tk.Label(form, text="لم يتم اختيار ملف")
        self.media_label.grid(row=len(fields)+1, column=1, sticky=tk.W)
        tk.Button(form, text="اختيار ملف...", command=self.select_media).grid(row=len(fields)+1, column=2, padx=5)
        # زر إضافة
        tk.Button(form, text="إضافة المنتج", command=self.add_product).grid(row=len(fields)+2, column=1, pady=10)

    def refresh_products(self):
        self.products = read_products()
        for row in self.tree.get_children():
            self.tree.delete(row)
        for prod in self.products:
            self.tree.insert("", tk.END, values=(prod.get("id", ""), prod.get("name", ""), prod.get("price", ""), prod.get("category", ""), prod.get("image", "")))

    def select_media(self):
        file_path = filedialog.askopenfilename(title="اختر صورة أو فيديو", filetypes=[("كل الملفات", "*.*")])
        if file_path:
            self.selected_media_path = file_path
            self.media_label.config(text=os.path.basename(file_path))

    def add_product(self):
        prod = {k: v.get().strip() for k, v in self.inputs.items()}
        # تحويد السعر إلى رقم
        try:
            prod["price"] = float(prod["price"])
        except ValueError:
            messagebox.showerror("خطأ", "السعر يجب أن يكون رقمًا.")
            return
        # إضافة الفئة من القائمة المنسدلة
        prod["category"] = self.category_var.get()
        if not all(prod.values()):
            messagebox.showerror("خطأ", "يرجى تعبئة جميع الحقول.")
            return
        # تحقق من تكرار id
        if any(p["id"] == prod["id"] for p in self.products):
            messagebox.showerror("خطأ", "معرّف المنتج مستخدم مسبقًا.")
            return
        # توليد id متسلسل تلقائي
        if self.products:
            last_id = max(int(p["id"]) for p in self.products if p["id"].isdigit())
            new_id = str(last_id + 1)
        else:
            new_id = "1"
        prod["id"] = new_id
        # نسخ الوسائط
        if self.selected_media_path:
            media_path = copy_media(self.selected_media_path)
            prod["image"] = media_path
            prod["images"] = f'[{repr(media_path)}]'
        else:
            prod["image"] = ""
            prod["images"] = "[]"
        self.products.append(prod)
        write_products(self.products)
        self.selected_media_path = None
        self.media_label.config(text="لم يتم اختيار ملف")
        for v in self.inputs.values():
            v.delete(0, tk.END)
        self.category_var.set(CATEGORIES[0])
        self.refresh_products()
        messagebox.showinfo("تمت الإضافة", "تمت إضافة المنتج بنجاح.")

    def delete_selected(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showwarning("تنبيه", "يرجى اختيار منتج للحذف.")
            return
        idx = self.tree.index(selected[0])
        prod = self.products[idx]
        if messagebox.askyesno("تأكيد الحذف", f"هل أنت متأكد من حذف المنتج: {prod.get('name', '')}؟"):
            del self.products[idx]
            write_products(self.products)
            self.refresh_products()
            messagebox.showinfo("تم الحذف", "تم حذف المنتج بنجاح.")

if __name__ == "__main__":
    app = ProductManagerApp()
    app.mainloop() 