import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import os
from utils import read_products, write_products, copy_media
from utils import read_ads, write_ads
from utils import read_socials, write_socials

CATEGORIES = ['Perfumes', 'Apparel', 'Creams']

class ProductManagerApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("إدارة المنتجات")
        self.geometry("900x600")
        self.products = []
        self.selected_media_paths = []
        self.main_image_index = tk.IntVar(value=0)
        self.ads = []
        self.selected_ad_image = None
        self.socials = {}
        self.create_widgets()
        self.refresh_products()
        self.refresh_ads()
        self.refresh_socials()

    def create_widgets(self):
        notebook = ttk.Notebook(self)
        notebook.pack(fill=tk.BOTH, expand=True)

        # --- تبويب المنتجات ---
        products_tab = tk.Frame(notebook)
        notebook.add(products_tab, text="المنتجات")
        # قائمة المنتجات
        self.tree = ttk.Treeview(products_tab, columns=("id", "name", "price", "category", "image"), show="headings")
        for col in ("id", "name", "price", "category", "image"):
            self.tree.heading(col, text=col)
            self.tree.column(col, width=120)
        self.tree.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        # أزرار
        btn_frame = tk.Frame(products_tab)
        btn_frame.pack(fill=tk.X, padx=10)
        tk.Button(btn_frame, text="تحديث", command=self.refresh_products).pack(side=tk.LEFT, padx=5)
        tk.Button(btn_frame, text="حذف المنتج المحدد", command=self.delete_selected).pack(side=tk.LEFT, padx=5)
        # نموذج إضافة منتج
        form = tk.LabelFrame(products_tab, text="إضافة منتج جديد")
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
        tk.Label(form, text="الفئة").grid(row=len(fields), column=0, sticky=tk.W, pady=2)
        self.category_var = tk.StringVar()
        self.category_var.set(CATEGORIES[0])
        category_menu = ttk.Combobox(form, textvariable=self.category_var, values=CATEGORIES, state="readonly", width=47)
        category_menu.grid(row=len(fields), column=1, pady=2)
        tk.Label(form, text="الصور").grid(row=len(fields)+1, column=0, sticky=tk.W, pady=2)
        self.media_label = tk.Label(form, text="لم يتم اختيار ملفات")
        self.media_label.grid(row=len(fields)+1, column=1, sticky=tk.W)
        tk.Button(form, text="اختيار ملفات...", command=self.select_media).grid(row=len(fields)+1, column=2, padx=5)
        self.main_image_frame = tk.Frame(form)
        self.main_image_frame.grid(row=len(fields)+2, column=1, sticky=tk.W)
        tk.Button(form, text="إضافة المنتج", command=self.add_product).grid(row=len(fields)+3, column=1, pady=10)

        # --- تبويب الدعايات ---
        ads_tab = tk.Frame(notebook)
        notebook.add(ads_tab, text="الدعايات")
        ads_frame = tk.LabelFrame(ads_tab, text="إدارة الدعايات (السلايدر)")
        ads_frame.pack(fill=tk.BOTH, padx=10, pady=10, expand=True)
        self.ads_listbox = tk.Listbox(ads_frame, height=5)
        self.ads_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5, pady=5)
        self.ads_listbox.bind('<Double-Button-1>', self.show_ad_image)
        ads_btns = tk.Frame(ads_frame)
        ads_btns.pack(side=tk.LEFT, fill=tk.Y, padx=5)
        tk.Button(ads_btns, text="حذف الدعاية المحددة", command=self.delete_selected_ad).pack(fill=tk.X, pady=2)
        ad_form = tk.LabelFrame(ads_frame, text="إضافة دعاية جديدة")
        ad_form.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10, pady=5)
        tk.Label(ad_form, text="نص الدعاية:").grid(row=0, column=0, sticky=tk.W)
        self.ad_text_entry = tk.Entry(ad_form, width=40)
        self.ad_text_entry.grid(row=0, column=1, pady=2)
        tk.Label(ad_form, text="صورة الدعاية:").grid(row=1, column=0, sticky=tk.W)
        self.ad_image_label = tk.Label(ad_form, text="لم يتم اختيار صورة")
        self.ad_image_label.grid(row=1, column=1, sticky=tk.W)
        tk.Button(ad_form, text="اختيار صورة...", command=self.select_ad_image).grid(row=1, column=2, padx=5)
        tk.Button(ad_form, text="إضافة الدعاية", command=self.add_ad).grid(row=2, column=1, pady=8)

        # --- تبويب روابط التواصل ---
        socials_tab = tk.Frame(notebook)
        notebook.add(socials_tab, text="روابط التواصل")
        socials_frame = tk.LabelFrame(socials_tab, text="روابط مواقع التواصل الاجتماعي")
        socials_frame.pack(fill=tk.X, padx=10, pady=10)
        self.social_entries = {}
        socials_fields = [
            ("facebook", "رابط فيسبوك"),
            ("instagram", "رابط انستجرام"),
            ("snapchat", "رابط سناب شات"),
            ("whatsapp", "رابط واتساب"),
            ("tiktok", "رابط تيك توك")
        ]
        for i, (key, label) in enumerate(socials_fields):
            tk.Label(socials_frame, text=label).grid(row=i, column=0, sticky=tk.W, pady=2)
            entry = tk.Entry(socials_frame, width=60)
            entry.grid(row=i, column=1, pady=2)
            self.social_entries[key] = entry
        tk.Button(socials_frame, text="حفظ الروابط", command=self.save_socials).grid(row=len(socials_fields), column=1, pady=8)

    def refresh_products(self):
        self.products = read_products()
        for row in self.tree.get_children():
            self.tree.delete(row)
        for prod in self.products:
            self.tree.insert("", tk.END, values=(prod.get("id", ""), prod.get("name", ""), prod.get("price", ""), prod.get("category", ""), prod.get("image", "")))

    def select_media(self):
        file_paths = filedialog.askopenfilenames(title="اختر صور", filetypes=[("كل الملفات", "*.*")])
        if file_paths:
            self.selected_media_paths = list(file_paths)
            names = ", ".join([os.path.basename(p) for p in self.selected_media_paths])
            self.media_label.config(text=names)
            # تحديث قائمة اختيار الصورة الرئيسية
            for widget in self.main_image_frame.winfo_children():
                widget.destroy()
            for idx, path in enumerate(self.selected_media_paths):
                rb = tk.Radiobutton(self.main_image_frame, text=os.path.basename(path), variable=self.main_image_index, value=idx)
                rb.pack(anchor=tk.W)
            self.main_image_index.set(0)
        else:
            self.selected_media_paths = []
            self.media_label.config(text="لم يتم اختيار ملفات")
            for widget in self.main_image_frame.winfo_children():
                widget.destroy()

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
        # توليد id متسلسل تلقائي
        ids = [int(p.get("id", 0)) for p in self.products if str(p.get("id", "")).isdigit()]
        last_id = max(ids) if ids else 0
        new_id = str(last_id + 1)
        prod["id"] = new_id
        # نسخ الوسائط
        if self.selected_media_paths:
            media_paths = [copy_media(p) for p in self.selected_media_paths]
            main_idx = self.main_image_index.get() if 0 <= self.main_image_index.get() < len(media_paths) else 0
            prod["image"] = media_paths[main_idx]
            prod["images"] = f'[{", ".join(repr(p) for p in media_paths)}]'
        else:
            prod["image"] = ""
            prod["images"] = "[]"
        self.products.append(prod)
        write_products(self.products)
        self.selected_media_paths = []
        self.media_label.config(text="لم يتم اختيار ملفات")
        for widget in self.main_image_frame.winfo_children():
            widget.destroy()
        self.main_image_index.set(0)
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

    def refresh_ads(self):
        self.ads = read_ads()
        self.ads_listbox.delete(0, tk.END)
        for ad in self.ads:
            self.ads_listbox.insert(tk.END, f"{ad.get('text', '')} | {os.path.basename(ad.get('image', ''))}")

    def select_ad_image(self):
        file_path = filedialog.askopenfilename(title="اختر صورة الدعاية", filetypes=[("صور", "*.jpg;*.jpeg;*.png;*.webp;*.gif")])
        if file_path:
            self.selected_ad_image = file_path
            self.ad_image_label.config(text=os.path.basename(file_path))
        else:
            self.selected_ad_image = None
            self.ad_image_label.config(text="لم يتم اختيار صورة")

    def add_ad(self):
        text = self.ad_text_entry.get().strip()
        if not text or not self.selected_ad_image:
            messagebox.showerror("خطأ", "يرجى إدخال نص الدعاية واختيار صورة.")
            return
        # نسخ الصورة إلى مجلد المنتجات
        image_path = copy_media(self.selected_ad_image)
        ad = {"text": text, "image": image_path}
        self.ads.append(ad)
        write_ads(self.ads)
        self.refresh_ads()
        self.selected_ad_image = None
        self.ad_image_label.config(text="لم يتم اختيار صورة")
        self.ad_text_entry.delete(0, tk.END)
        messagebox.showinfo("تمت الإضافة", "تمت إضافة الدعاية بنجاح.")

    def delete_selected_ad(self):
        idx = self.ads_listbox.curselection()
        if not idx:
            messagebox.showwarning("تنبيه", "يرجى اختيار دعاية للحذف.")
            return
        idx = idx[0]
        if messagebox.askyesno("تأكيد الحذف", f"هل أنت متأكد من حذف الدعاية: {self.ads[idx].get('text', '')}؟"):
            del self.ads[idx]
            write_ads(self.ads)
            self.refresh_ads()
            messagebox.showinfo("تم الحذف", "تم حذف الدعاية بنجاح.")

    def show_ad_image(self, event):
        idx = self.ads_listbox.curselection()
        if not idx:
            return
        idx = idx[0]
        ad = self.ads[idx]
        image_path = ad.get('image', '')
        if image_path:
            # حاول فتح الصورة عبر النظام
            try:
                import webbrowser
                webbrowser.open(image_path)
            except Exception:
                pass

    def refresh_socials(self):
        self.socials = read_socials()
        for key, entry in self.social_entries.items():
            entry.delete(0, tk.END)
            entry.insert(0, self.socials.get(key, ""))

    def save_socials(self):
        for key, entry in self.social_entries.items():
            self.socials[key] = entry.get().strip()
        write_socials(self.socials)
        messagebox.showinfo("تم الحفظ", "تم حفظ روابط مواقع التواصل بنجاح.")

if __name__ == "__main__":
    app = ProductManagerApp()
    app.mainloop() 