import type { Lesson } from "@/lib/types";

export const lessons: Lesson[] = [
  {
    id: "tensors-basics",
    title: "أساسيات التوتّرات (Tensors)",
    titleEn: "Tensor Fundamentals",
    description:
      "التوتّر هو حجر الأساس في PyTorch: مصفوفة متعددة الأبعاد يمكنها الحساب على GPU وتتبّع عملياتها لاحتساب المشتقات. في هذا الدرس تنشئ أول توتّر وتتعرّف على أهم العمليات.",
    descriptionEn:
      "The tensor is the cornerstone of PyTorch: a multi-dimensional array that can compute on the GPU and track its operations for automatic differentiation. In this lesson you create your first tensor and meet the essential operations.",
    level: "beginner",
    durationMin: 15,
    tags: ["torch", "tensor", "GPU"],
    sections: [
      {
        heading: "ما هو التوتّر؟",
        headingEn: "What is a tensor?",
        body: "التوتّر (Tensor) يشبه مصفوفات NumPy لكنه يضيف شيئين حاسمين: تسريع على GPU عبر CUDA، وقدرة على تتبّع عملياته لدعم الانتشار العكسي (autograd). أنشئ توتّرك الأول بـ torch.tensor أو بدوال الإنشاء الجاهزة.",
        bodyEn:
          "A tensor is like a NumPy array, but it adds two crucial capabilities: GPU acceleration through CUDA, and the ability to track its operations to power backpropagation (autograd). Create your first tensor with torch.tensor or the ready-made factory functions.",
        code: `import torch

# Create tensors from lists
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
        tipEn:
          "Use torch.zeros / torch.ones / torch.randn to create tensors quickly without any initial data.",
      },
      {
        heading: "العمليات الأساسية",
        headingEn: "Basic operations",
        body: "العمليات الحسابية بين التوتّرات تُطبَّق عنصرًا بعنصر افتراضيًا، والضرب المصفوفي يتم بـ @ أو torch.matmul. كل عملية تُعيد توتّرًا جديدًا (الأسلوب الوظيفي) أو تعدّل في المكان بلوحة (_) للحفظ في الذاكرة.",
        bodyEn:
          "Arithmetic between tensors is element-wise by default, and matrix multiplication is done with @ or torch.matmul. Every operation returns a new tensor (the functional style) or modifies in place with a trailing underscore (_) to save memory.",
        code: `x = torch.tensor([1., 2., 3.])
y = torch.tensor([10., 20., 30.])

print(x + y)          # element-wise sum
print(x * y)          # element-wise product
print(y @ x)          # inner (dot) product
print(torch.exp(x))   # math function`,
        output: `tensor([11., 22., 33.])
tensor([10., 40., 90.])
tensor(140.)
tensor([ 2.7183,  7.3891, 20.0855])`,
      },
      {
        heading: "التشكيل والتقطيع",
        headingEn: "Reshaping & slicing",
        body: "تغيير الشكل لا ينسخ البيانات عادةً — view و reshape يعيدان تفسير نفس الذاكرة عند الإمكان. التقطيع يعمل مثل NumPy تمامًا، وunsqueeze تضيف بعدًا جديدًا وهو أمر يومي عند تجهيز الدُفعات (batches).",
        bodyEn:
          "Reshaping usually doesn't copy data — view and reshape reinterpret the same memory when possible. Slicing works exactly like NumPy, and unsqueeze adds a new dimension — a daily ritual when preparing batches.",
        code: `m = torch.arange(12.)
print(m.view(3, 4))        # 3 rows × 4 columns
print(m.view(3, 4)[:, 1])  # second column
v = torch.arange(3.)
print(v.unsqueeze(0).shape)  # (1, 3) row vector
print(v.unsqueeze(1).shape)  # (3, 1) column vector`,
        output: `tensor([[ 0.,  1.,  2.,  3.],
        [ 4.,  5.,  6.,  7.],
        [ 8.,  9., 10., 11.]])
tensor([ 1.,  5.,  9.])
torch.Size([1, 3])
torch.Size([3, 1])`,
        tip: "view تتطلب ذاكرة متصلة (contiguous)؛ إذا ظهر خطأ استخدم reshape فهي أكثر تسامحًا.",
        tipEn:
          "view requires contiguous memory; if you hit an error, use reshape — it is more forgiving.",
      },
      {
        heading: "الانتقال إلى GPU",
        headingEn: "Moving to the GPU",
        body: "أكبر ميزة في PyTorch هي نقل الحساب إلى وحدة معالجة الرسوميات بسطر واحد. القاعدة الذهبية: كل التوتّرات المشاركة في عملية واحدة يجب أن تكون على نفس الجهاز (device).",
        bodyEn:
          "PyTorch's biggest advantage is moving computation to the GPU with a single line. Golden rule: every tensor taking part in one operation must live on the same device.",
        code: `device = "cuda" if torch.cuda.is_available() else "cpu"
x = torch.randn(1000, 1000, device=device)
y = x @ x.T            # matrix multiplication on GPU
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
    descriptionEn:
      "With torch.nn you build networks as a class inheriting nn.Module: define the layers in the constructor and wire them together in forward. The result is an object that can be trained, serialized, and moved between devices.",
    level: "beginner",
    durationMin: 20,
    tags: ["nn.Module", "Linear", "ReLU"],
    sections: [
      {
        heading: "صنف nn.Module",
        headingEn: "The nn.Module class",
        body: "كل نموذج يرث من nn.Module. في __init__ تعرّف الطبقات (التي تحتوي الأوزان القابلة للتعلّم)، وفي forward تعرّف مسار البيانات. PyTorch يتتبّع الأوزان تلقائيًا — لا تحتاج كتابة شيء يدوي.",
        bodyEn:
          "Every model inherits from nn.Module. In __init__ you define the layers (which hold the learnable weights), and in forward you define the data path. PyTorch tracks the weights automatically — no manual bookkeeping needed.",
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
        tipEn:
          "Don't call forward directly — call model(x) instead, because it fires the hooks before the call.",
      },
      {
        heading: "تمرير البيانات عبر الشبكة",
        headingEn: "Passing data through the network",
        body: "الدخل دائمًا توتّر يبدأ بعدد العينات في المحور الأول: دفعة من 8 عينات بأربعة خصائص تكون شكلها (8, 4) والخرج (8, 3). احصل على عدد المعاملات القابلة للتعلّم بدالة بسيطة.",
        bodyEn:
          "The input is always a tensor with the sample count on the first axis: a batch of 8 samples with four features has shape (8, 4) and produces an output of (8, 3). Get the number of learnable parameters with a simple one-liner.",
        code: `X = torch.randn(8, 4)
logits = model(X)
print(logits.shape)

n_params = sum(p.numel() for p in model.parameters())
print("عدد المعاملات:", n_params)`,
        output: `torch.Size([8, 3])
عدد المعاملات: 131`,
        outputEn: `torch.Size([8, 3])
Number of parameters: 131`,
      },
      {
        heading: "اختيار دالة الخسارة",
        headingEn: "Choosing a loss function",
        body: "للتصنيف متعدد الفئات نستخدم CrossEntropyLoss مع الخرج الخام (logits) — الدالة تدمج LogSoftmax و NLLLoss داخليًا. للانحدار (regression) نستخدم MSELoss عادةً.",
        bodyEn:
          "For multi-class classification we use CrossEntropyLoss with the raw outputs (logits) — the function fuses LogSoftmax and NLLLoss internally. For regression we usually use MSELoss.",
        code: `criterion = nn.CrossEntropyLoss()
y = torch.tensor([0, 2, 1, 0, 1, 2, 0, 1])

loss = criterion(logits, y)
print(loss.item())   # scalar value`,
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
    descriptionEn:
      "The dynamic computational graph (define-by-run) records operations as they execute, then computes the derivatives backwards with backward(). This is what sets PyTorch apart from the older static-graph frameworks.",
    level: "intermediate",
    durationMin: 20,
    tags: ["autograd", "backward", "requires_grad"],
    sections: [
      {
        heading: "تتبّع المشتقات",
        headingEn: "Tracking gradients",
        body: "أي توتّر بـ requires_grad=True يجعل كل العمليات عليه تُسجَّل في مخطط حسابي. استدعِ backward() على الناتج ليُحتسب التدرّج للجميع ويتخزّن في الخاصية .grad.",
        bodyEn:
          "Any tensor with requires_grad=True makes every operation on it get recorded into a computational graph. Call backward() on the result to compute the gradient for everything, stored in each tensor's .grad attribute.",
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
        tipEn:
          "x.grad accumulates between calls! Reset it explicitly with x.grad.zero_() or use optimizer.zero_grad().",
      },
      {
        heading: "المخطط الديناميكي (define-by-run)",
        headingEn: "The dynamic graph (define-by-run)",
        body: "المخطط يُبنى عند التنفيذ: يمكنك استخدام شروط وحلقات بايثون العادية داخل الحساب، ويتفرّع المخطط وفقًا لذلك. هذا يُبسّط نماذج مثل RNN والتحكم الديناميكي مقارنة بالأطر الثابتة.",
        bodyEn:
          "The graph is built as you execute: you can use ordinary Python conditions and loops inside the computation, and the graph branches accordingly. This simplifies models like RNNs and dynamic control compared to static frameworks.",
        code: `def dynamic_net(x, depth):
    # the same function builds a different graph per depth
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
        headingEn: "Disabling tracking with no_grad",
        body: "في التقييم والاستدلال لا نحتاج المشتقات — أوقف التتبّع بـ torch.no_grad() لتوفير الذاكرة وتسريع الحساب. ولتحديث الأوزان يدويًا داخل التدريب نستخدمه أيضًا حتى لا يُسجَّل التحديث نفسه في المخطط.",
        bodyEn:
          "During evaluation and inference we don't need gradients — stop tracking with torch.no_grad() to save memory and speed up computation. We also use it when updating weights manually during training so the update itself isn't recorded in the graph.",
        code: `with torch.no_grad():
    out = model(X)          # no computational graph here
print(out.requires_grad)

for p in model.parameters():
    p.requires_grad_(False) # freeze the whole model (fine-tuning)`,
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
    descriptionEn:
      "Training in PyTorch is an explicit loop you write yourself: forward pass, loss, backward, update step — and repeat. This transparency is the secret behind the framework's flexibility in research.",
    level: "intermediate",
    durationMin: 25,
    tags: ["optim", "SGD", "Adam", "training"],
    sections: [
      {
        heading: "الوصفة الخمسية",
        headingEn: "The five-step recipe",
        body: "كل تدريب يتبع النمط نفسه: (1) zero_grad لمسح المشتقات المتراكمة، (2) تمرير أمامي، (3) احتساب الخسارة، (4) backward، (5) optimizer.step للتحديث. جرّبها على مسألة انحدار خطي بسيطة.",
        bodyEn:
          "Every training run follows the same pattern: (1) zero_grad to clear accumulated gradients, (2) forward pass, (3) compute the loss, (4) backward, (5) optimizer.step to update. Try it on a simple linear regression problem.",
        code: `import torch

# synthetic data: y = 3x + 2
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
        tipEn:
          "Forgetting opt.zero_grad() is the most common beginner mistake — gradients accumulate and corrupt the training.",
      },
      {
        heading: "Adam vs SGD",
        headingEn: "Adam vs SGD",
        body: "SGD الكلاسيكي (مع momentum) ما زال خيار أوراق البحث الكبرى، بينما Adam و AdamW يتكيّفان مع مقياس التدرّجات لكل معامل فيتعلمون أسرع من دون ضبط دقيق لسرعة التعلم. AdamW يفصل تلاشي الأوزان (weight decay) عن التدرّج وهو المعيار الحالي للمحوّلات (Transformers).",
        bodyEn:
          "Classic SGD (with momentum) is still the choice of major research papers, while Adam and AdamW adapt to the gradient scale of each parameter, so they learn faster without careful learning-rate tuning. AdamW separates weight decay from the gradient and is the current standard for Transformers.",
        code: `opt_sgd  = torch.optim.SGD(model.parameters(), lr=0.01, momentum=0.9)
opt_adam = torch.optim.Adam(model.parameters(), lr=1e-3)
opt_adamw = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.01)

# LR scheduling: step it down every 10 epochs
sched = torch.optim.lr_scheduler.StepLR(opt_adam, step_size=10, gamma=0.5)
print(sched.get_last_lr())`,
        output: `[0.001]`,
      },
      {
        heading: "التحقق وتقييم النموذج",
        headingEn: "Validation & model evaluation",
        body: "قسّم دائمًا بياناتك: تدريب للتعلم وتحقق للمراقبة. في طور التقييم ضع model.eval() لإيقاف Dropout وتثبيت BatchNorm، واستخدم no_grad كما رأينا في درس autograd.",
        bodyEn:
          "Always split your data: training for learning and validation for monitoring. In evaluation mode set model.eval() to disable Dropout and freeze BatchNorm, and use no_grad as we saw in the autograd lesson.",
        code: `model.train()   # training mode
# ... training loop ...

model.eval()    # evaluation mode
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
    descriptionEn:
      "torch.utils.data separates data-loading logic from the model. A Dataset defines a single sample, and a DataLoader wraps it with batching, shuffling, and parallel loading across worker processes.",
    level: "intermediate",
    durationMin: 20,
    tags: ["DataLoader", "Dataset", "batch"],
    sections: [
      {
        heading: "تعريف Dataset مخصص",
        headingEn: "Defining a custom Dataset",
        body: "يرث صنفك من torch.utils.data.Dataset ويطبّق __len__ و __getitem__. أي مصدر بيانات يناسبك — ملفات على القرص، قاعدة بيانات، أو توليد برمجي.",
        bodyEn:
          "Your class inherits from torch.utils.data.Dataset and implements __len__ and __getitem__. Any data source works — files on disk, a database, or programmatic generation.",
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
        headingEn: "Batches, shuffling & parallelism",
        body: "DataLoader يأخذ Dataset ويمنحك مُكرِّرًا (iterator) ينتج دُفعات جاهزة: batch_size لحجم الدفعة، shuffle للخلط في كل حقبة، و num_workers لتحميل البيانات في عمليات منفصلة بالتوازي مع حساب GPU.",
        bodyEn:
          "DataLoader takes a Dataset and gives you an iterator that yields ready-made batches: batch_size for the batch size, shuffle to reshuffle every epoch, and num_workers to load data in separate processes in parallel with GPU computation.",
        code: `from torch.utils.data import DataLoader

loader = DataLoader(ds, batch_size=64, shuffle=True, num_workers=2)

for xb, yb in loader:      # one random batch
    print(xb.shape, yb.shape)
    break`,
        output: `torch.Size([64, 2]) torch.Size([64])`,
        tip: "num_workers>1 يخفي زمن قراءة القرص خلف حساب GPU — أكبر تسريع مجاني في خطوط البيانات الحقيقية.",
        tipEn:
          "num_workers>1 hides disk-read latency behind GPU computation — the biggest free speedup in real data pipelines.",
      },
      {
        heading: "تقسيم التدريب/التحقق",
        headingEn: "Train/validation split",
        body: "استخدم random_split لتقسيم Dataset إلى أجزاء بنسب محددة، مع تثبيت البذرة (seed) لضمان قابلية تكرار التجارب — مبدأ أساسي في البحث العلمي.",
        bodyEn:
          "Use random_split to divide a Dataset into parts with given proportions, fixing the seed to keep experiments reproducible — a core principle of scientific research.",
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
    descriptionEn:
      "Moving from the research notebook to the server: TorchScript converts your model into an intermediate representation that runs without Python, with operator fusions and optimizations, loadable from native C++ applications.",
    level: "advanced",
    durationMin: 25,
    tags: ["TorchScript", "deployment", "ONNX"],
    sections: [
      {
        heading: "التتبّع (tracing) مقابل التحويل (scripting)",
        headingEn: "Tracing vs scripting",
        body: "torch.jit.trace يسجّل مسار تنفيذ واحد لعينة مثالية — سريع لكنه لا يدعم الفروع الديناميكية. torch.jit.script يحلل كود بايثون نفسه ويدعم الشروط والحلقات. اختر trace للنماذج المستقيمة و script لغيرها.",
        bodyEn:
          "torch.jit.trace records a single execution path for a sample input — fast, but it doesn't support dynamic branches. torch.jit.script analyzes the Python code itself and supports conditions and loops. Choose trace for straight-line models and script for everything else.",
        code: `import torch

traced = torch.jit.trace(model.eval(), torch.randn(1, 4))
print(traced.code)

scripted = torch.jit.script(model)   # supports dynamic control flow`,
        output: `def forward(self, x: Tensor) -> Tensor:
  _0 = torch.relu(torch.linear(x, ..., ...))
  return torch.linear(_0, ..., ...)`,
      },
      {
        heading: "الحفظ والتحميل",
        headingEn: "Saving & loading",
        body: "صيغة TorchScript تحمل البنية والأوزان معًا في ملف واحد — لا حاجة لتعريف الصنف عند التحميل. هذا الملف يعمل في TorchScript Runtime أو من C++ مباشرة.",
        bodyEn:
          "The TorchScript format carries the architecture and the weights together in one file — no need to redefine the class when loading. That file runs in the TorchScript Runtime or straight from C++.",
        code: `scripted.save("model.pt")

loaded = torch.jit.load("model.pt")
loaded.eval()
print(loaded(torch.randn(2, 4)).shape)`,
        output: `torch.Size([2, 3])`,
        tip: "لحفظ الأوزان فقط أثناء البحث استخدم torch.save(model.state_dict(), ...) ثم أعد بناء الصنف قبل التحميل.",
        tipEn:
          "To save weights only during research, use torch.save(model.state_dict(), ...), then rebuild the class before loading.",
      },
      {
        heading: "خارطة طريق النشر",
        headingEn: "The deployment roadmap",
        body: "خيارات الإنتاج مرتّبة حسب السيناريو: TorchServe لخدمة REST/gRPC قابلة للتوسّع، ONNX لالتوافق مع محركات أخرى (TensorRT، OpenVINO)، و ExecuTorch للهواتف والأجهزة الطرفية (mobile/edge).",
        bodyEn:
          "Production options ordered by scenario: TorchServe for scalable REST/gRPC serving, ONNX for compatibility with other engines (TensorRT, OpenVINO), and ExecuTorch for phones and edge devices.",
        code: `# ONNX export (consumable by TensorRT and others)
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
