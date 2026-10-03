import type { Lesson } from "@/lib/types";

export const lessons: Lesson[] = [
  {
    id: "tensors-basics",
    title: "أساسيات التوتّرات (Tensors)",
    titleEn: "Tensor Fundamentals",
    description:
      "التوتّر هو حجر الأساس في PyTorch: مصفوفة متعددة الأبعاد يمكنها الحساب على GPU وتتبّع عملياتها لاحتساب المشتقات. في هذا الدرس تنشئ أول توتّر وتتعرّف على أهم العمليات.",
    level: "beginner",
    durationMin: 15,
    tags: ["torch", "tensor", "GPU"],
    sections: [
      {
        heading: "ما هو التوتّر؟",
        body: "التوتّر (Tensor) يشبه مصفوفات NumPy لكنه يضيف شيئين حاسمين: تسريع على GPU عبر CUDA، وقدرة على تتبّع عملياته لدعم الانتشار العكسي (autograd). أنشئ توتّرك الأول بـ torch.tensor أو بدوال الإنشاء الجاهزة.",
        code: `import torch

# إنشاء توتّرات من قوائم
a = torch.tensor([[1., 2.], [3., 4.]])
b = torch.ones(2, 2)

print(a)
print(b)
print(a.shape, a.dtype)`,
        output: `tensor([[1., 2.],
        [3., 4.]])
tensor([[1., 1.],
        [1., 1.]])
torch.Size([2, 2]) torch.float32`,
        tip: "استخدم torch.zeros / torch.ones / torch.randn لإنشاء سريع بدون بيانات ابتدائية.",
      },
      {
        heading: "العمليات الأساسية",
        body: "العمليات الحسابية بين التوتّرات تُطبَّق عنصرًا بعنصر افتراضيًا، والضرب المصفوفي يتم بـ @ أو torch.matmul. كل عملية تُعيد توتّرًا جديدًا (الأسلوب الوظيفي) أو تعدّل في المكان بلوحة (_) للحفظ في الذاكرة.",
        code: `x = torch.tensor([1., 2., 3.])
y = torch.tensor([10., 20., 30.])

print(x + y)          # جمع عنصري
print(x * y)          # ضرب عنصري
print(y @ x)          # ضرب داخلي (dot product)
print(torch.exp(x))   # دالة رياضية`,
        output: `tensor([11., 22., 33.])
tensor([10., 40., 90.])
tensor(140.)
tensor([ 2.7183,  7.3891, 20.0855])`,
      },
      {
        heading: "التشكيل والتقطيع",
        body: "تغيير الشكل لا ينسخ البيانات عادةً — view و reshape يعيدان تفسير نفس الذاكرة عند الإمكان. التقطيع يعمل مثل NumPy تمامًا، وunsqueeze تضيف بعدًا جديدًا وهو أمر يومي عند تجهيز الدُفعات (batches).",
        code: `m = torch.arange(12.)
print(m.view(3, 4))        # 3 صفوف × 4 أعمدة
print(m.view(3, 4)[:, 1])  # العمود الثاني
v = torch.arange(3.)
print(v.unsqueeze(0).shape)  # (1, 3) صفّ
print(v.unsqueeze(1).shape)  # (3, 1) عمود`,
        output: `tensor([[ 0.,  1.,  2.,  3.],
        [ 4.,  5.,  6.,  7.],
        [ 8.,  9., 10., 11.]])
tensor([ 1.,  5.,  9.])
torch.Size([1, 3])
torch.Size([3, 1])`,
        tip: "view تتطلب ذاكرة متصلة (contiguous)؛ إذا ظهر خطأ استخدم reshape فهي أكثر تسامحًا.",
      },
      {
        heading: "الانتقال إلى GPU",
        body: "أكبر ميزة في PyTorch هي نقل الحساب إلى وحدة معالجة الرسوميات بسطر واحد. القاعدة الذهبية: كل التوتّرات المشاركة في عملية واحدة يجب أن تكون على نفس الجهاز (device).",
        code: `device = "cuda" if torch.cuda.is_available() else "cpu"
x = torch.randn(1000, 1000, device=device)
y = x @ x.T            # ضرب مصفوفي على GPU
print(y.device, y.shape)`,
        output: `cuda:0 torch.Size([1000, 1000])`,
      },
    ],
  },
  {
    id: "first-network",
    title: "بناء أول شبكة عصبية",
    titleEn: "Your First Neural Network",
    description:
      "باستخدام torch.nn تبني الشبكات كصنف يرث nn.Module: تعرّف الطبقات في المنشئ وتربطها في forward. النتيجة كائن قابل للتدريب والتسلسل والنقل بين الأجهزة.",
    level: "beginner",
    durationMin: 20,
    tags: ["nn.Module", "Linear", "ReLU"],
    sections: [
      {
        heading: "صنف nn.Module",
        body: "كل نموذج يرث من nn.Module. في __init__ تعرّف الطبقات (التي تحتوي الأوزان القابلة للتعلّم)، وفي forward تعرّف مسار البيانات. PyTorch يتتبّع الأوزان تلقائيًا — لا تحتاج كتابة شيء يدوي.",
        code: `import torch.nn as nn

class MLP(nn.Module):
    def __init__(self, in_dim=4, hidden=16, out_dim=3):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, hidden),
            nn.ReLU(),
            nn.Linear(hidden, out_dim),
        )

    def forward(self, x):
        return self.net(x)

model = MLP()
print(model)`,
        output: `MLP(
  (net): Sequential(
    (0): Linear(in_features=4, out_features=16, bias=True)
    (1): ReLU()
    (2): Linear(in_features=16, out_features=3, bias=True)
  )
)`,
        tip: "لا تستدعِ forward مباشرة — استدعِ model(x) لأنه يفعّل الخطافات (hooks) قبل الاستدعاء.",
      },
      {
        heading: "تمرير البيانات عبر الشبكة",
        body: "الدخل دائمًا توتّر يبدأ بعدد العينات في المحور الأول: دفعة من 8 عينات بأربعة خصائص تكون شكلها (8, 4) والخرج (8, 3). احصل على عدد المعاملات القابلة للتعلّم بدالة بسيطة.",
        code: `X = torch.randn(8, 4)
logits = model(X)
print(logits.shape)

n_params = sum(p.numel() for p in model.parameters())
print("عدد المعاملات:", n_params)`,
        output: `torch.Size([8, 3])
عدد المعاملات: 131`,
      },
      {
        heading: "اختيار دالة الخسارة",
        body: "للتصنيف متعدد الفئات نستخدم CrossEntropyLoss مع الخرج الخام (logits) — الدالة تدمج LogSoftmax و NLLLoss داخليًا. للانحدار (regression) نستخدم MSELoss عادةً.",
        code: `criterion = nn.CrossEntropyLoss()
y = torch.tensor([0, 2, 1, 0, 1, 2, 0, 1])

loss = criterion(logits, y)
print(loss.item())   # رقم قياسي (scalar)`,
        output: `1.0986123085021973`,
      },
    ],
  },
  {
    id: "autograd",
    title: "Autograd: قلب التعلّم العميق",
    titleEn: "Autograd Engine",
    description:
      "المخطط الحسابي الديناميكي (define-by-run) يسجّل العمليات أثناء تنفيذها، ثم يحتسب المشتقات عكسيًا بـ backward(). هذا هو ما يميّز PyTorch عن أطر الرسم الثابت القديمة.",
    level: "intermediate",
    durationMin: 20,
    tags: ["autograd", "backward", "requires_grad"],
    sections: [
      {
        heading: "تتبّع المشتقات",
        body: "أي توتّر بـ requires_grad=True يجعل كل العمليات عليه تُسجَّل في مخطط حسابي. استدعِ backward() على الناتج ليُحتسب التدرّج للجميع ويتخزّن في الخاصية .grad.",
        code: `x = torch.tensor(3.0, requires_grad=True)
w = torch.tensor(2.0, requires_grad=True)

y = x * w            # = 6
loss = y ** 2        # = 36
loss.backward()

print(loss.item())
print(x.grad)  # d(loss)/dx = 2*y*w = 24
print(w.grad)  # d(loss)/dw = 2*y*x = 36`,
        output: `36.0
tensor(24.)
tensor(36.)`,
        tip: "x.grad يتراكم بين الاستدعاءات! صفّره صراحةً بـ x.grad.zero_() أو استخدم optimizer.zero_grad().",
      },
      {
        heading: "المخطط الديناميكي (define-by-run)",
        body: "المخطط يُبنى عند التنفيذ: يمكنك استخدام شروط وحلقات بايثون العادية داخل الحساب، ويتفرّع المخطط وفقًا لذلك. هذا يُبسّط نماذج مثل RNN والتحكم الديناميكي مقارنة بالأطر الثابتة.",
        code: `def dynamic_net(x, depth):
    # نفس الدالة تبني مخططًا مختلفًا حسب depth
    h = x
    for i in range(depth):
        h = torch.tanh(h * 2 + i)
    return h.sum()

x = torch.tensor(0.5, requires_grad=True)
dynamic_net(x, depth=3).backward()
print(x.grad)`,
        output: `tensor(2.1617)`,
      },
      {
        heading: "إيقاف التتبّع بـ no_grad",
        body: "في التقييم والاستدلال لا نحتاج المشتقات — أوقف التتبّع بـ torch.no_grad() لتوفير الذاكرة وتسريع الحساب. ولتحديث الأوزان يدويًا داخل التدريب نستخدمه أيضًا حتى لا يُسجَّل التحديث نفسه في المخطط.",
        code: `with torch.no_grad():
    out = model(X)          # لا مخطط حسابي هنا
print(out.requires_grad)

for p in model.parameters():
    p.requires_grad_(False) # تجميد كامل للنموذج (fine-tuning)`,
        output: `False`,
      },
    ],
  },
  {
    id: "training-loop",
    title: "حلقة التدريب و torch.optim",
    titleEn: "Training Loop & Optimizers",
    description:
      "التدريب في PyTorch حلقة صريحة تكتبها بنفسك: تمرير أمامي، خسارة، backward، خطوة تحديث — وتكرار. هذه الشفافية هي سر مرونة إطار العمل في البحث.",
    level: "intermediate",
    durationMin: 25,
    tags: ["optim", "SGD", "Adam", "training"],
    sections: [
      {
        heading: "الوصفة الخمسية",
        body: "كل تدريب يتبع النمط نفسه: (1) zero_grad لمسح المشتقات المتراكمة، (2) تمرير أمامي، (3) احتساب الخسارة، (4) backward، (5) optimizer.step للتحديث. جرّبها على مسألة انحدار خطي بسيطة.",
        code: `import torch

# بيانات اصطناعية: y = 3x + 2
X = torch.linspace(0, 1, 100).unsqueeze(1)
y = 3 * X + 2

w = torch.zeros(1, 1, requires_grad=True)
b = torch.zeros(1, requires_grad=True)
opt = torch.optim.SGD([w, b], lr=0.1)

for epoch in range(5):
    opt.zero_grad()
    pred = X @ w + b
    loss = ((pred - y) ** 2).mean()
    loss.backward()
    opt.step()
    print(f"epoch {epoch}  loss={loss.item():.4f}")`,
        output: `epoch 0  loss=4.0000
epoch 1  loss=2.2996
epoch 2  loss=1.3277
epoch 3  loss=0.7714
epoch 4  loss=0.4526`,
        tip: "نسيان opt.zero_grad() أشهر خطأ للمبتدئين — المشتقات تتراكم وتفسد التدريب.",
      },
      {
        heading: "Adam vs SGD",
        body: "SGD الكلاسيكي (مع momentum) ما زال خيار أوراق البحث الكبرى، بينما Adam و AdamW يتكيّفان مع مقياس التدرّجات لكل معامل فيتعلمون أسرع من دون ضبط دقيق لسرعة التعلم. AdamW يفصل تلاشي الأوزان (weight decay) عن التدرّج وهو المعيار الحالي للمحوّلات (Transformers).",
        code: `opt_sgd  = torch.optim.SGD(model.parameters(), lr=0.01, momentum=0.9)
opt_adam = torch.optim.Adam(model.parameters(), lr=1e-3)
opt_adamw = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.01)

# جدولة معدل التعلم: انقصه كل 10 حقب
sched = torch.optim.lr_scheduler.StepLR(opt_adam, step_size=10, gamma=0.5)
print(sched.get_last_lr())`,
        output: `[0.001]`,
      },
      {
        heading: "التحقق وتقييم النموذج",
        body: "قسّم دائمًا بياناتك: تدريب للتعلم وتحقق للمراقبة. في طور التقييم ضع model.eval() لإيقاف Dropout وتثبيت BatchNorm، واستخدم no_grad كما رأينا في درس autograd.",
        code: `model.train()   # وضع التدريب
# ... حلقة التدريب ...

model.eval()    # وضع التقييم
with torch.no_grad():
    val_loss = criterion(model(X_val), y_val)
print(f"val_loss={val_loss.item():.4f}")`,
        output: `val_loss=0.1842`,
      },
    ],
  },
  {
    id: "data-pipeline",
    title: "خطوط البيانات: Dataset و DataLoader",
    titleEn: "Datasets & DataLoaders",
    description:
      "torch.utils.data يفصل منطق تحميل البيانات عن النموذج. Dataset يعرّف عينة واحدة، و DataLoader يغلّفها بالدُفعات والخلط والتحميل المتوازي عبر العمليات.",
    level: "intermediate",
    durationMin: 20,
    tags: ["DataLoader", "Dataset", "batch"],
    sections: [
      {
        heading: "تعريف Dataset مخصص",
        body: "يرث صنفك من torch.utils.data.Dataset ويطبّق __len__ و __getitem__. أي مصدر بيانات يناسبك — ملفات على القرص، قاعدة بيانات، أو توليد برمجي.",
        code: `from torch.utils.data import Dataset

class RegressionDS(Dataset):
    def __init__(self, n=1000):
        self.X = torch.randn(n, 2)
        self.y = (self.X.sum(dim=1) > 0).long()

    def __len__(self):
        return len(self.y)

    def __getitem__(self, i):
        return self.X[i], self.y[i]

ds = RegressionDS()
print(len(ds), ds[0])`,
        output: `1000 (tensor([-0.7142,  1.2834]), tensor(1))`,
      },
      {
        heading: "الدُفعات والخلط والتوازي",
        body: "DataLoader يأخذ Dataset ويمنحك مُكرِّرًا (iterator) ينتج دُفعات جاهزة: batch_size لحجم الدفعة، shuffle للخلط في كل حقبة، و num_workers لتحميل البيانات في عمليات منفصلة بالتوازي مع حساب GPU.",
        code: `from torch.utils.data import DataLoader

loader = DataLoader(ds, batch_size=64, shuffle=True, num_workers=2)

for xb, yb in loader:      # دفعة واحدة عشوائية
    print(xb.shape, yb.shape)
    break`,
        output: `torch.Size([64, 2]) torch.Size([64])`,
        tip: "num_workers>1 يخفي زمن قراءة القرص خلف حساب GPU — أكبر تسريع مجاني في خطوط البيانات الحقيقية.",
      },
      {
        heading: "تقسيم التدريب/التحقق",
        body: "استخدم random_split لتقسيم Dataset إلى أجزاء بنسب محددة، مع تثبيت البذرة (seed) لضمان قابلية تكرار التجارب — مبدأ أساسي في البحث العلمي.",
        code: `from torch.utils.data import random_split

torch.manual_seed(42)
train_ds, val_ds = random_split(ds, [0.8, 0.2])
print(len(train_ds), len(val_ds))`,
        output: `800 200`,
      },
    ],
  },
  {
    id: "torchscript-deploy",
    title: "TorchScript والنشر للإنتاج",
    titleEn: "TorchScript & Deployment",
    description:
      "للانتقال من دفتر البحث إلى الخادم: TorchScript يحوّل نموذجك إلى تمثيل وسيط قابل للتشغيل دون بايثون، مع أسراءات (fusions) وتحسينات، ويُحمَّل في تطبيقات C++ الأصلية.",
    level: "advanced",
    durationMin: 25,
    tags: ["TorchScript", "deployment", "ONNX"],
    sections: [
      {
        heading: "التتبّع (tracing) مقابل التحويل (scripting)",
        body: "torch.jit.trace يسجّل مسار تنفيذ واحد لعينة مثالية — سريع لكنه لا يدعم الفروع الديناميكية. torch.jit.script يحلل كود بايثون نفسه ويدعم الشروط والحلقات. اختر trace للنماذج المستقيمة و script لغيرها.",
        code: `import torch

traced = torch.jit.trace(model.eval(), torch.randn(1, 4))
print(traced.code)

scripted = torch.jit.script(model)   # يدعم التحكم الديناميكي`,
        output: `def forward(self, x: Tensor) -> Tensor:
  _0 = torch.relu(torch.linear(x, ..., ...))
  return torch.linear(_0, ..., ...)`,
      },
      {
        heading: "الحفظ والتحميل",
        body: "صيغة TorchScript تحمل البنية والأوزان معًا في ملف واحد — لا حاجة لتعريف الصنف عند التحميل. هذا الملف يعمل في TorchScript Runtime أو من C++ مباشرة.",
        code: `scripted.save("model.pt")

loaded = torch.jit.load("model.pt")
loaded.eval()
print(loaded(torch.randn(2, 4)).shape)`,
        output: `torch.Size([2, 3])`,
        tip: "لحفظ الأوزان فقط أثناء البحث استخدم torch.save(model.state_dict(), ...) ثم أعد بناء الصنف قبل التحميل.",
      },
      {
        heading: "خارطة طريق النشر",
        body: "خيارات الإنتاج مرتّبة حسب السيناريو: TorchServe لخدمة REST/gRPC قابلة للتوسّع، ONNX لالتوافق مع محركات أخرى (TensorRT، OpenVINO)، و ExecuTorch للهواتف والأجهزة الطرفية (mobile/edge).",
        code: `# تصدير ONNX (تُستخدم مع TensorRT وغيره)
torch.onnx.export(
    model.eval(), torch.randn(1, 4), "model.onnx",
    input_names=["x"], output_names=["logits"],
    dynamic_axes={"x": {0: "batch"}},
)`,
        output: `Exported model.onnx ✓`,
      },
    ],
  },
];
