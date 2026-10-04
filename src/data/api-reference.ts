import type { DocGroup } from "@/lib/types";

export const docGroups: DocGroup[] = [
  {
    id: "tensor",
    name: "torch.Tensor",
    description:
      "قلب إطار العمل: مصفوفة متعددة الأبعاد بتسريع GPU وتتبّع تلقائي للمشتقات. هنا دوال الإنشاء وأهم العمليات اليومية.",
    descriptionEn:
      "The heart of the framework: a GPU-accelerated N-dimensional array with automatic differentiation. Tensor creation and the everyday workhorse ops live here.",
    entries: [
      {
        name: "torch.tensor",
        signature: "torch.tensor(data, *, dtype=None, device=None, requires_grad=False) → Tensor",
        kind: "function",
        description: "ينشئ توتّرًا من بيانات موجودة (قائمة، مصفوفة NumPy…) وينسخها افتراضيًا.",
        descriptionEn:
          "Creates a tensor from existing data (list, NumPy array, …), copying it by default.",
        params: [
          { name: "data", type: "array_like", desc: "البيانات الابتدائية: قوائم متداخلة أو NumPy array.", descEn: "Initial data: nested lists or a NumPy array." },
          { name: "dtype", type: "torch.dtype", desc: "نوع العناصر، مثل torch.float32.", descEn: "Element type, e.g. torch.float32." },
          { name: "device", type: "torch.device", desc: "الجهاز المستهدف: 'cpu' أو 'cuda:0'.", descEn: "Target device: 'cpu' or 'cuda:0'." },
          { name: "requires_grad", type: "bool", desc: "تفعيل تتبّع المشتقات عبر autograd.", descEn: "Enable autograd tracking for this tensor." },
        ],
        returns: "Tensor جديد يحمل نسخة من البيانات.",
        returnsEn: "A new Tensor holding a copy of the data.",
        example: `x = torch.tensor([[1., 2.], [3., 4.]], requires_grad=True)\nprint(x.shape)  # torch.Size([2, 2])`,
      },
      {
        name: "torch.zeros",
        signature: "torch.zeros(*size, out=None, dtype=None, device=None) → Tensor",
        kind: "function",
        description: "توتّر مملوء بالأصفار بالشكل المحدد — شائع لتهيئة المُرحّلات (buffers) والمُجمّعات.",
        descriptionEn:
          "A tensor filled with zeros of the given shape — the usual way to initialize buffers and accumulators.",
        params: [{ name: "*size", type: "int...", desc: "أبعاد الشكل، مثل (3, 4).", descEn: "Shape dimensions, e.g. (3, 4)." }],
        returns: "Tensor قيمه 0.",
        returnsEn: "A Tensor filled with zeros.",
        example: `z = torch.zeros(2, 3)\nprint(z)`,
      },
      {
        name: "torch.ones",
        signature: "torch.ones(*size, dtype=None, device=None) → Tensor",
        kind: "function",
        description: "توتّر مملوء بالواحدات — مثل أصفار لكن بقيمة 1.",
        descriptionEn:
          "A tensor filled with ones — like torch.zeros, but with the fill value 1.",
        returns: "Tensor قيمه 1.",
        returnsEn: "A Tensor filled with ones.",
        example: `o = torch.ones(2, 2)`,
      },
      {
        name: "torch.randn",
        signature: "torch.randn(*size, generator=None, dtype=None) → Tensor",
        kind: "function",
        description: "عينات من التوزيع الطبيعي القياسي N(0, 1) — التهيئة الافتراضية لأوزان معظم الطبقات التجريبية.",
        descriptionEn:
          "Samples from the standard normal distribution N(0, 1) — the default weight initialization for most experimental layers.",
        returns: "Tensor بقيم عشوائية طبيعية.",
        returnsEn: "A Tensor of standard-normal random values.",
        example: `w = torch.randn(64, 32) * 0.02  # تهيئة GPT-style`,
      },
      {
        name: "Tensor.view",
        signature: "Tensor.view(*shape) → Tensor",
        kind: "method",
        description: "يعيد تفسير بيانات التوتّر بشكل جديد دون نسخ (يتطلب ذاكرة متصلة). أسرع من reshape عندما يتوفر شرط الاتصال.",
        descriptionEn:
          "Reinterprets the tensor's data with a new shape without copying (requires contiguous memory). Faster than reshape when the contiguity condition holds.",
        params: [{ name: "*shape", type: "int...", desc: "الشكل الجديد؛ يمكن استخدام -1 للاستنتاج.", descEn: "The new shape; -1 infers that dimension." }],
        returns: "Tensor جديد يشترك في نفس الذاكرة.",
        returnsEn: "A new Tensor sharing the same storage.",
        example: `x = torch.arange(6)\nx.view(2, 3)`,
      },
      {
        name: "Tensor.reshape",
        signature: "Tensor.reshape(*shape) → Tensor",
        kind: "method",
        description: "مثل view لكن أكثر تسامحًا: ينسخ البيانات تلقائيًا إن كانت الذاكرة غير متصلة.",
        descriptionEn:
          "Like view but more forgiving: copies the data automatically when the memory is not contiguous.",
        example: `x = torch.transpose(torch.arange(6).view(2, 3), 0, 1)\nx.reshape(6)  # نسخة هنا`,
      },
      {
        name: "Tensor.unsqueeze",
        signature: "Tensor.unsqueeze(dim) → Tensor",
        kind: "method",
        description: "يضيف بعدًا بحجم 1 في الموقع المحدد — الخطوة اليومية لتحويل عينة واحدة إلى دفعة.",
        descriptionEn:
          "Adds a size-1 dimension at the given position — the everyday step that turns a single sample into a batch.",
        params: [{ name: "dim", type: "int", desc: "موقع البعد الجديد (يدعم القيم السالبة).", descEn: "Position of the new dimension (negative values supported)." }],
        example: `img = torch.randn(3, 224, 224)\nbatch = img.unsqueeze(0)  # (1, 3, 224, 224)`,
      },
      {
        name: "Tensor.squeeze",
        signature: "Tensor.squeeze(dim=None) → Tensor",
        kind: "method",
        description: "يزيل كل الأبعاد ذات الحجم 1 (أو بعدًا محددًا). عكس unsqueeze.",
        descriptionEn:
          "Removes all size-1 dimensions (or one specified dimension). The inverse of unsqueeze.",
        example: `x = torch.zeros(1, 4, 1)\nprint(x.squeeze().shape)  # (4,)`,
      },
      {
        name: "torch.cat",
        signature: "torch.cat(tensors, dim=0) → Tensor",
        kind: "function",
        description: "يدمج قائمة توتّرات على بعد موجود — لصق على طول المحور.",
        descriptionEn:
          "Concatenates a list of tensors along an existing dimension — gluing along the axis.",
        params: [
          { name: "tensors", type: "Sequence[Tensor]", desc: "التوتّرات؛ يجب أن تتطابق في بقية الأبعاد.", descEn: "The tensors; they must match in every other dimension." },
          { name: "dim", type: "int", desc: "المحور الذي يتم الالصق عليه.", descEn: "The dimension to concatenate along." },
        ],
        example: `a, b = torch.ones(2, 2), torch.zeros(2, 2)\nprint(torch.cat([a, b], dim=0).shape)  # (4, 2)`,
      },
      {
        name: "torch.stack",
        signature: "torch.stack(tensors, dim=0) → Tensor",
        kind: "function",
        description: "مثل cat لكنه يضيف بعدًا جديدًا — الأساس في تجميع الدُفعات من عينات مفردة.",
        descriptionEn:
          "Like cat but adds a new dimension — the foundation for batching single samples together.",
        example: `xs = [torch.randn(3) for _ in range(5)]\nprint(torch.stack(xs).shape)  # (5, 3)`,
      },
      {
        name: "torch.matmul",
        signature: "torch.matmul(input, other) → Tensor",
        kind: "function",
        description: "الضرب المصفوفي العام: يعالج ناقلات ومصفوفات ودُفعاتها بذكاء. المكافئ للمعامل @.",
        descriptionEn:
          "General matrix multiplication: handles vectors, matrices, and their batches intelligently. Equivalent to the @ operator.",
        example: `A, B = torch.randn(4, 3), torch.randn(3, 5)\nprint((A @ B).shape)  # (4, 5)`,
      },
      {
        name: "Tensor.sum",
        signature: "Tensor.sum(dim=None, keepdim=False) → Tensor",
        kind: "method",
        description: "الجمع على كل العناصر أو على محور محدد — أبسط مثال على عمليات الاختزال (reduction).",
        descriptionEn:
          "Sums over all elements or along a given axis — the simplest example of a reduction op.",
        params: [{ name: "dim", type: "int | tuple", desc: "المحور/المحاور المراد جمعها؛ None يعني الكل.", descEn: "Axis or axes to sum over; None means all." }],
        example: `x = torch.ones(2, 3)\nprint(x.sum(dim=0))  # tensor([2., 2., 2.])`,
      },
      {
        name: "Tensor.argmax",
        signature: "Tensor.argmax(dim=None, keepdim=False) → Tensor",
        kind: "method",
        description: "فهرس أكبر قيمة على المحور — الخطوة الأخيرة لتحويل logits إلى تنبؤات الفئات.",
        descriptionEn:
          "Index of the largest value along an axis — the last step that turns logits into class predictions.",
        example: `logits = torch.randn(4, 10)\npreds = logits.argmax(dim=1)  # فئة لكل عينة`,
      },
      {
        name: "Tensor.to",
        signature: "Tensor.to(*args, **kwargs) → Tensor",
        kind: "method",
        description: "نقل التوتّر إلى جهاز أو نوع بيانات آخر — بوابة GPU الرسمية. عملية غير مُعدِّلة تعيد نسخة.",
        descriptionEn:
          "Moves the tensor to another device or dtype — the official gateway to the GPU. A non-mutating op that returns a copy.",
        example: `x = torch.randn(2, 2)\nx = x.to("cuda")          # نقل إلى GPU\nx = x.to(torch.float16)   # دقة مخفضة (AMP)`,
      },
      {
        name: "Tensor.backward",
        signature: "Tensor.backward(gradient=None, retain_graph=False) → None",
        kind: "method",
        description: "يحتسب المشتقات للناتج الحالي عكسيًا عبر المخطط الحسابي ويخزنها في .grad لكل ورقة requires_grad.",
        descriptionEn:
          "Computes the gradients of the current output in reverse mode through the computational graph and stores them in .grad of every requires_grad leaf.",
        example: `loss = criterion(model(x), y)\nloss.backward()  # يملأ p.grad لكل المعاملات`,
      },
      {
        name: "Tensor.requires_grad",
        signature: "Tensor.requires_grad → bool",
        kind: "property",
        description: "خاصية تقرأ (ولها نسخة setter عبر requires_grad_) هل يُتتبَّع هذا التوتّر في autograd.",
        descriptionEn:
          "Property that reads (with a setter counterpart, requires_grad_) whether this tensor is being tracked by autograd.",
        example: `w = torch.randn(3, requires_grad=True)\nprint(w.requires_grad)  # True`,
      },
      {
        name: "Tensor.detach",
        signature: "Tensor.detach() → Tensor",
        kind: "method",
        description: "يفصل التوتّر عن المخطط الحسابي: قيمة مشتركة بلا تتبّع. يُستخدم لأخذ الخرج للعرض أو للمعالجة خارج التدريب.",
        descriptionEn:
          "Detaches the tensor from the computational graph: a shared value with no gradient tracking. Used to take outputs out of training for display or post-processing.",
        example: `emb = model.embed(x).detach().cpu().numpy()`,
      },
      {
        name: "Tensor.item",
        signature: "Tensor.item() → number",
        kind: "method",
        description: "يستخرج قيمة توتّر أحادي العنصر كرقم بايثون عادي — الطريقة المعتمدة لقراءة قيمة الخسارة للسجلات.",
        descriptionEn:
          "Extracts the value of a single-element tensor as a plain Python number — the sanctioned way to read a loss value for logging.",
        example: `print(f"loss={loss.item():.4f}")`,
      },
      {
        name: "torch.save",
        signature: "torch.save(obj, f) → None",
        kind: "function",
        description: "يسلسل أي كائن (عادة state_dict) إلى ملف بصيغة pickle — حفظ نقاط التفتيش (checkpoints).",
        descriptionEn:
          "Serializes any object (usually a state_dict) to a pickle file — how checkpoints are saved.",
        example: `torch.save(model.state_dict(), "ckpt.pt")`,
      },
      {
        name: "torch.load",
        signature: "torch.load(f, map_location=None) → object",
        kind: "function",
        description: "يحمّل ما حفظه torch.save. استخدم map_location لنقل الأوزان إلى جهاز مختلف عن جهاز الحفظ.",
        descriptionEn:
          "Loads what torch.save wrote. Use map_location to remap the weights to a different device than the one they were saved on.",
        example: `state = torch.load("ckpt.pt", map_location="cpu")\nmodel.load_state_dict(state)`,
      },
    ],
  },
  {
    id: "autograd",
    name: "torch.autograd",
    description:
      "محرك المشتقات التلقائي: يسجّل العمليات في مخطط ديناميكي ويحتسب التدرّجات عكسيًا — ما يجعل define-by-run ممكنًا.",
    descriptionEn:
      "The automatic-differentiation engine: records operations into a dynamic graph and backpropagates through it — what makes define-by-run possible.",
    entries: [
      {
        name: "torch.autograd.backward",
        signature: "torch.autograd.backward(tensors, grad_tensors=None, retain_graph=None)",
        kind: "function",
        description: "النسخة الوظيفية لـ Tensor.backward: تحتسب التدرّجات لقائمة نتائج (تدعم multi-task losses).",
        descriptionEn:
          "The functional form of Tensor.backward: computes gradients for a list of outputs (supports multi-task losses).",
        example: `torch.autograd.backward([loss1, loss2], [torch.ones_like(loss1), torch.ones_like(loss2)])`,
      },
      {
        name: "torch.autograd.grad",
        signature: "torch.autograd.grad(outputs, inputs, grad_outputs=None) → tuple[Tensor]",
        kind: "function",
        description: "يحتسب المشتقات ويعيدها كقيم بدل تخزينها في .grad — أسلوب مكتبات التقطيع والتقطيع العصبي.",
        descriptionEn:
          "Computes the gradients and returns them as values instead of storing them in .grad — the style used by saliency and neural-pruning libraries.",
        example: `(dx,) = torch.autograd.grad(y, x)\nprint(dx)`,
      },
      {
        name: "torch.no_grad",
        signature: "torch.no_grad() → context manager",
        kind: "function",
        description: "سياق يعطّل بناء المخطط داخله: أسرى وأقل ذاكرة. إلزامي في الاستدلال والتحقق.",
        descriptionEn:
          "Context manager that disables graph building inside it: faster and lighter on memory. Mandatory for inference and validation.",
        example: `with torch.no_grad():\n    val_loss = criterion(model(xv), yv)`,
      },
      {
        name: "torch.enable_grad",
        signature: "torch.enable_grad() → context manager",
        kind: "function",
        description: "يفعّل التتبّع داخله حتى لو كان معطلًا خارجيًا — مفيد داخل دوال جاكس-ستايل أو meta-learning.",
        descriptionEn:
          "Enables gradient tracking inside it even when disabled externally — useful inside JAX-style functions or meta-learning.",
        example: `with torch.no_grad():\n    with torch.enable_grad():\n        inner = fn(x.requires_grad_(True))`,
      },
      {
        name: "torch.autograd.Function",
        signature: "class torch.autograd.Function",
        kind: "class",
        description: "الأساس لتعريف عمليات مخصصة: تطبّق forward و backward يدويًا عندما تحتاج تحكمًا كاملًا أو تفويضًا لـ C++/CUDA.",
        descriptionEn:
          "The base class for custom autograd operations: you implement forward and backward by hand when you need full control or delegation to C++/CUDA.",
        example: `class Square(torch.autograd.Function):\n    @staticmethod\n    def forward(ctx, x):\n        ctx.save_for_backward(x)\n        return x ** 2\n\n    @staticmethod\n    def backward(ctx, g):\n        (x,) = ctx.saved_tensors\n        return 2 * g * x`,
      },
      {
        name: "Tensor.register_hook",
        signature: "Tensor.register_hook(hook: Callable) → RemovableHandle",
        kind: "method",
        description: "يثبّت خطافًا (hook) يُستدعى عند مرور التدرّج في هذا التوتّر — أداة تشخيص وتعديل التدرّجات (مثل gradient clipping اليدوي).",
        descriptionEn:
          "Attaches a hook that fires whenever a gradient flows through this tensor — a tool for inspecting and modifying gradients (e.g. manual gradient clipping).",
        example: `h = x.register_hook(lambda g: g.clamp(-1, 1))\nh.remove()  # إزالة الخطاف`,
      },
    ],
  },
  {
    id: "nn",
    name: "torch.nn",
    description:
      "لبنات الشبكات: طبقات، دوال تنشيط، خسائر، وحاويات — كلها ترث nn.Module وتتكامل تلقائيًا مع autograd و state_dict.",
    descriptionEn:
      "Network building blocks: layers, activations, losses, and containers — all subclassing nn.Module and integrating with autograd and state_dict automatically.",
    entries: [
      {
        name: "nn.Module",
        signature: "class nn.Module",
        kind: "class",
        description: "الأب لكل مكونات النموذج: يتابع الأوزان والوحدات الفرعية، يوفر forward و to() و eval/train والحفظ.",
        descriptionEn:
          "The base class of every model component: tracks parameters and submodules, and provides forward, to(), eval()/train(), and checkpointing.",
        example: `class Net(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.fc = nn.Linear(10, 2)\n    def forward(self, x):\n        return self.fc(x)`,
      },
      {
        name: "nn.Linear",
        signature: "nn.Linear(in_features, out_features, bias=True)",
        kind: "class",
        description: "الطبقة الخطية الكاملة: y = xWᵀ + b. اللبنة الأكثر استخدامًا في كل معمارية تقريبًا.",
        descriptionEn:
          "Fully-connected linear layer: y = xWᵀ + b. The most-used building block in almost every architecture.",
        params: [
          { name: "in_features", type: "int", desc: "حجم الدخل لكل عينة.", descEn: "Size of each input sample." },
          { name: "out_features", type: "int", desc: "حجم الخرج.", descEn: "Size of the output." },
        ],
        example: `fc = nn.Linear(512, 10)\ny = fc(x)  # (B, 512) → (B, 10)`,
      },
      {
        name: "nn.Conv2d",
        signature: "nn.Conv2d(in_channels, out_channels, kernel_size, stride=1, padding=0)",
        kind: "class",
        description: "الالتفاف ثنائي الأبعاد — أساس الرؤية الحاسوبية: يستخرج ملامح محلية مع مشاركة الأوزان.",
        descriptionEn:
          "2D convolution — the foundation of computer vision: extracts local features with shared weights.",
        example: `conv = nn.Conv2d(3, 64, kernel_size=3, padding=1)\ny = conv(torch.randn(1, 3, 224, 224))  # (1, 64, 224, 224)`,
      },
      {
        name: "nn.LSTM",
        signature: "nn.LSTM(input_size, hidden_size, num_layers=1, batch_first=False, bidirectional=False)",
        kind: "class",
        description: "شبكة الذاكرة قصيرة/طويلة الأمد للتسلسلات الزمنية والنصوص، مع حالة مخفية وحالة خلية عبر الزمن.",
        descriptionEn:
          "Long short-term memory network for time series and text, carrying a hidden state and a cell state across time steps.",
        example: `lstm = nn.LSTM(128, 256, batch_first=True)\nout, (h, c) = lstm(x)  # x: (B, T, 128)`,
      },
      {
        name: "nn.Embedding",
        signature: "nn.Embedding(num_embeddings, embedding_dim)",
        kind: "class",
        description: "جدول بحث يربط فهارس الرموز بمتجهات كثيفة — حجر أساس NLP وتوصيّة الأغراض.",
        descriptionEn:
          "A lookup table mapping token indices to dense vectors — the cornerstone of NLP and recommender systems.",
        example: `emb = nn.Embedding(vocab_size, 256)\nvectors = emb(tokens)  # (B, T, 256)`,
      },
      {
        name: "nn.ReLU",
        signature: "nn.ReLU(inplace=False)",
        kind: "class",
        description: "التنشيط القياسي max(0, x) — غير خطية بلا تشبّع للقيم الموجبة وسريعة جدًا.",
        descriptionEn:
          "The standard activation max(0, x) — a nonlinearity that never saturates for positive values and is extremely fast.",
        example: `act = nn.ReLU()`,
      },
      {
        name: "nn.Sigmoid",
        signature: "nn.Sigmoid()",
        kind: "class",
        description: "يحوّل أي قيمة إلى (0, 1) — للتصنيف الثنائي كبوابات في LSTM وأعمدة الخرج الاحتمالي.",
        descriptionEn:
          "Squashes any value into (0, 1) — used for binary classification, as LSTM gates, and for probabilistic output heads.",
        example: `p = nn.Sigmoid()(logits)`,
      },
      {
        name: "nn.Softmax",
        signature: "nn.Softmax(dim=-1)",
        kind: "class",
        description: "يحوّل المتجه إلى توزيع احتمالي مجموعه 1. في الخسائر استخدم CrossEntropyLoss ولا تضع Softmax قبله.",
        descriptionEn:
          "Turns a vector into a probability distribution summing to 1. For losses use CrossEntropyLoss — never apply Softmax before it.",
        example: `probs = nn.Softmax(dim=-1)(logits)`,
      },
      {
        name: "nn.Dropout",
        signature: "nn.Dropout(p=0.5)",
        kind: "class",
        description: "يصفّر نسبة من العناصر عشوائيًا في التدريب لتنظيم النموذج، ويتوقف في eval تلقائيًا.",
        descriptionEn:
          "Randomly zeroes a fraction of elements during training to regularize the model; switches off automatically in eval mode.",
        example: `drop = nn.Dropout(p=0.1)  # نسبة المحوّلات`,
      },
      {
        name: "nn.BatchNorm2d",
        signature: "nn.BatchNorm2d(num_features, momentum=0.1, affine=True)",
        kind: "class",
        description: "تطبيع الدُفعة للالتفاف: يستقر إحصائيات كل قناة فيسرّع التقارب. يتأثر بحجم الدفعة — أو فكّر في GroupNorm.",
        descriptionEn:
          "Batch normalization for convolutions: stabilizes per-channel statistics, speeding up convergence. Sensitive to batch size — consider GroupNorm instead.",
        example: `bn = nn.BatchNorm2d(64)`,
      },
      {
        name: "nn.LayerNorm",
        signature: "nn.LayerNorm(normalized_shape, eps=1e-5)",
        kind: "class",
        description: "التطبيع عبر خصائص كل عينة على حدة — لا يعتمد على حجم الدفعة، والمعيار في المحوّلات.",
        descriptionEn:
          "Normalizes over the features of each sample independently — independent of batch size and the standard in Transformers.",
        example: `ln = nn.LayerNorm(512)`,
      },
      {
        name: "nn.CrossEntropyLoss",
        signature: "nn.CrossEntropyLoss(weight=None, label_smoothing=0.0)",
        kind: "class",
        description: "خسارة التصنيف المعيارية: تدمج LogSoftmax + NLLLoss وتأخذ logits خام. تدعم أوزان الفئات غير المتوازنة.",
        descriptionEn:
          "The standard classification loss: combines LogSoftmax + NLLLoss and takes raw logits. Supports class weights for imbalanced data.",
        example: `crit = nn.CrossEntropyLoss(label_smoothing=0.1)\nloss = crit(logits, y)`,
      },
      {
        name: "nn.MSELoss",
        signature: "nn.MSELoss(reduction='mean')",
        kind: "class",
        description: "متوسط مربع الفروق — خسارة الانحدار الكلاسيكية. حساسة للقيم الشاذة؛ فكّر في L1 أو Huber.",
        descriptionEn:
          "Mean squared error — the classic regression loss. Sensitive to outliers; consider L1 or Huber instead.",
        example: `crit = nn.MSELoss()\nloss = crit(pred, target)`,
      },
      {
        name: "nn.Sequential",
        signature: "nn.Sequential(*modules)",
        kind: "class",
        description: "حاوية تُشغّل الوحدات بالترتيب — forward بدون كتابة صنف كامل للنماذج المستقيمة.",
        descriptionEn:
          "A container that runs modules in order — a forward pass without writing a full class, for straight-through models.",
        example: `head = nn.Sequential(\n    nn.Linear(256, 64), nn.GELU(),\n    nn.Dropout(0.1), nn.Linear(64, 4),\n)`,
      },
      {
        name: "nn.Module.load_state_dict",
        signature: "Module.load_state_dict(state_dict, strict=True)",
        kind: "method",
        description: "يحمّل الأوزان في النموذج من قاموس حالة — نقطة التفتيش القياسية. strict=False يقبل مفاتيح ناقصة.",
        descriptionEn:
          "Loads weights into the model from a state dict — the standard checkpoint restore. strict=False accepts missing keys.",
        example: `model.load_state_dict(torch.load("ckpt.pt", map_location="cpu"))`,
      },
    ],
  },
  {
    id: "optim",
    name: "torch.optim",
    description:
      "محسّنات التدرّج ومجدولات معدل التعلم: كل خوارزميات التحديث الجاهزة مع واجهة موحدة (zero_grad / step).",
    descriptionEn:
      "Gradient optimizers and learning-rate schedulers: every built-in update rule behind one uniform interface (zero_grad / step).",
    entries: [
      {
        name: "torch.optim.SGD",
        signature: "SGD(params, lr, momentum=0, weight_decay=0, nesterov=False)",
        kind: "class",
        description: "النزول التدريجي العشوائي. مع momentum=0.9 يظل خيارًا قويًا للرؤية الحاسوبية (ResNet وأخواتها).",
        descriptionEn:
          "Stochastic gradient descent. With momentum=0.9 it remains a strong choice for computer vision (ResNet and friends).",
        params: [
          { name: "params", type: "Iterable[Parameter]", desc: "معاملات النموذج (غالبًا model.parameters()).", descEn: "Model parameters (usually model.parameters())." },
          { name: "lr", type: "float", desc: "معدل التعلم — أهم معامل فردي في التدريب.", descEn: "Learning rate — the single most influential hyperparameter in training." },
        ],
        example: `opt = torch.optim.SGD(model.parameters(), lr=0.1, momentum=0.9)`,
      },
      {
        name: "torch.optim.Adam",
        signature: "Adam(params, lr=1e-3, betas=(0.9, 0.999), eps=1e-8)",
        kind: "class",
        description: "تدرّج تكيفي بعزوم أولى وثانية — تقارب سريع من دون ضبط دقيق، الافتراضي الجيد للنماذج الجديدة.",
        descriptionEn:
          "Adaptive gradients via first and second moments — fast convergence without fine tuning; the good default for new models.",
        example: `opt = torch.optim.Adam(model.parameters(), lr=1e-3)`,
      },
      {
        name: "torch.optim.AdamW",
        signature: "AdamW(params, lr=1e-3, weight_decay=1e-2)",
        kind: "class",
        description: "Adam مع تلاشي أوزان صحيح (منفصل عن التدرّج) — المعيار الفعلي لتدريب المحوّلات مثل BERT وGPT.",
        descriptionEn:
          "Adam with proper (decoupled) weight decay — the de-facto standard for training Transformers like BERT and GPT.",
        example: `opt = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.01)`,
      },
      {
        name: "torch.optim.RMSprop",
        signature: "RMSprop(params, lr=1e-2, alpha=0.99)",
        kind: "class",
        description: "يقسم التدرّج على متوسط متحرك لمربعه — كان الخيار التاريخي للشبكات المتكررة والتعلم المعزز.",
        descriptionEn:
          "Divides the gradient by a moving average of its square — the historical pick for recurrent networks and reinforcement learning.",
        example: `opt = torch.optim.RMSprop(model.parameters(), lr=1e-4)`,
      },
      {
        name: "Optimizer.zero_grad",
        signature: "Optimizer.zero_grad(set_to_none=True)",
        kind: "method",
        description: "يمسح مشتقات المعاملات المتراكمة من الخطوة السابقة. استدعاءه مرة قبل backward في كل تكرار شرط صحة التدريب.",
        descriptionEn:
          "Clears the parameter gradients accumulated by the previous step. Calling it once before backward in every iteration is a correctness requirement for training.",
        example: `for xb, yb in loader:\n    opt.zero_grad()\n    loss.backward()\n    opt.step()`,
      },
      {
        name: "Optimizer.step",
        signature: "Optimizer.step(closure=None)",
        kind: "method",
        description: "يطبّق قاعدة التحديث باستخدام المشتقات الحالية — التحقق الفعلي لخطوة التعلم.",
        descriptionEn:
          "Applies the update rule using the current gradients — the actual learning step.",
        example: `loss.backward()\nopt.step()`,
      },
      {
        name: "lr_scheduler.CosineAnnealingLR",
        signature: "CosineAnnealingLR(optimizer, T_max, eta_min=0)",
        kind: "class",
        description: "ينقص معدل التعلم بمنحنى جيبي حتى قيمة دنيا على مدى T_max تكرارًا — شائع في تدريب المحوّلات.",
        descriptionEn:
          "Decays the learning rate along a cosine curve down to a minimum over T_max iterations — common in Transformer training.",
        example: `sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=1000)\n# بعد كل خطوة: sched.step()`,
      },
      {
        name: "lr_scheduler.OneCycleLR",
        signature: "OneCycleLR(optimizer, max_lr, total_steps, pct_start=0.3)",
        kind: "class",
        description: "سياسة super-convergence: تسخين سريع إلى ذروة ثم تبريد جيبي — تدريب أقصر بدقة أعلى.",
        descriptionEn:
          "The super-convergence policy: a fast warm-up to a peak, then cosine annealing — shorter training with higher accuracy.",
        example: `sched = torch.optim.lr_scheduler.OneCycleLR(opt, max_lr=1e-2, total_steps=steps)`,
      },
    ],
  },
  {
    id: "utils-data",
    name: "torch.utils.data",
    description:
      "أدوات خطوط البيانات: تعريف المصادر ولفّها بدُفعات وخلط وتحميل متوازي — الجسر بين القرص و GPU.",
    descriptionEn:
      "Data-pipeline tooling: define sources, wrap them into batches, shuffle, and load in parallel — the bridge between disk and GPU.",
    entries: [
      {
        name: "Dataset",
        signature: "class Dataset",
        kind: "class",
        description: "الواجهة المجردة لمصدر البيانات: طبّق __len__ و __getitem__ في أي صنف تريده.",
        descriptionEn:
          "The abstract interface for a data source: implement __len__ and __getitem__ on any class of yours.",
        example: `class MyDS(Dataset):\n    def __len__(self): return N\n    def __getitem__(self, i): return X[i], y[i]`,
      },
      {
        name: "DataLoader",
        signature: "DataLoader(dataset, batch_size=1, shuffle=False, num_workers=0, pin_memory=False)",
        kind: "class",
        description: "المُكرِّر القياسي: يغلّف Dataset بدُفعات مع خلط وتحميل متوازٍ عبر num_workers و pin_memory لنقل أسرع إلى GPU.",
        descriptionEn:
          "The standard iterator: wraps a Dataset into batches with shuffling and parallel loading via num_workers, plus pin_memory for faster host-to-GPU transfers.",
        params: [
          { name: "dataset", type: "Dataset", desc: "المصدر.", descEn: "The source dataset." },
          { name: "batch_size", type: "int", desc: "عدد العينات في الدفعة.", descEn: "Number of samples per batch." },
          { name: "num_workers", type: "int", desc: "عمليات التحميل المتوازية.", descEn: "Parallel loader worker processes." },
        ],
        example: `loader = DataLoader(train_ds, batch_size=64, shuffle=True, num_workers=4, pin_memory=True)`,
      },
      {
        name: "random_split",
        signature: "random_split(dataset, lengths, generator=None) → list[Subset]",
        kind: "function",
        description: "يقسم Dataset عشوائيًا إلى أجزاء غير متداخلة (تدريب/تحقق/اختبار). مرّر generator ببذرة مثبتة للتكرارية.",
        descriptionEn:
          "Splits a Dataset randomly into non-overlapping subsets (train/val/test). Pass a seeded generator for reproducibility.",
        example: `g = torch.Generator().manual_seed(42)\ntrain, val = random_split(ds, [0.8, 0.2], generator=g)`,
      },
      {
        name: "TensorDataset",
        signature: "TensorDataset(*tensors)",
        kind: "class",
        description: "يغلّف توتّرات موجودة كـ Dataset جاهز — لربط X و y سريعًا من دون صنف مخصص.",
        descriptionEn:
          "Wraps existing tensors into a ready-made Dataset — the quick way to pair X and y without a custom class.",
        example: `ds = TensorDataset(X_train, y_train)`,
      },
    ],
  },
  {
    id: "misc",
    name: "أدوات متفرقة",
    nameEn: "Misc utilities",
    description:
      "دوال عابرة للمكونات تستخدمها يوميًا: الأجهزة، البذور، التحكم بالتدريب، والحفظ الآمن للنماذج.",
    descriptionEn:
      "Cross-cutting utilities you reach for every day: devices, seeds, training controls, and safe model saving.",
    entries: [
      {
        name: "torch.cuda.is_available",
        signature: "torch.cuda.is_available() → bool",
        kind: "function",
        description: "يتحقق من توفر GPU مع إصدار CUDA الصحيح — أول سطر في أي سكربت تدريب محمول.",
        descriptionEn:
          "Checks whether a GPU with a compatible CUDA build is available — the first line of any portable training script.",
        example: `device = "cuda" if torch.cuda.is_available() else "cpu"`,
      },
      {
        name: "torch.manual_seed",
        signature: "torch.manual_seed(seed)",
        kind: "function",
        description: "يثبّت بذرة العشوائية على CPU و GPU معًا — شرط قابلية تكرار التجارب.",
        descriptionEn:
          "Seeds the random generators on both CPU and GPU — the prerequisite for reproducible experiments.",
        example: `torch.manual_seed(42)`,
      },
      {
        name: "torch.amp.autocast",
        signature: "torch.amp.autocast(device_type='cuda', dtype=torch.float16)",
        kind: "function",
        description: "تدريب الدقة المختلطة: يشغّل العمليات بدقة مخفضة تلقائيًا — تسريع 2–3× وتوفير ذاكرة كبير على GPU الحديثة.",
        descriptionEn:
          "Mixed-precision training: runs ops in reduced precision automatically — 2–3× speedups and large memory savings on modern GPUs.",
        example: `with torch.amp.autocast("cuda"):\n    loss = criterion(model(x), y)`,
      },
      {
        name: "torch.amp.GradScaler",
        signature: "torch.amp.GradScaler(device='cuda', enabled=True)",
        kind: "class",
        description: "يضخّم الخسارة قبل backward لمنع تلاشي التدرّجات في fp16 ثم يفكّ الضخّ قبل step — شريك autocast الإلزامي.",
        descriptionEn:
          "Scales the loss up before backward to prevent gradient underflow in fp16, then unscales before step — autocast's mandatory companion.",
        example: `scaler = torch.amp.GradScaler("cuda")\nwith torch.amp.autocast("cuda"):\n    loss = model(x).sum()\nscaler.scale(loss).backward()\nscaler.step(opt); scaler.update()`,
      },
      {
        name: "torch.compile",
        signature: "torch.compile(model, mode='default') → OptimizedModule",
        kind: "function",
        description: "المُصرّف الجديد (PyTorch 2.x): يجمع النموذج إلى كيرنلات محسّنة عبر TorchDynamo/Inductor — تسريع كبير بتعديل سطر واحد.",
        descriptionEn:
          "The new compiler (PyTorch 2.x): compiles the model into optimized kernels via TorchDynamo/Inductor — a large speedup for a one-line change.",
        example: `model = torch.compile(model)\n# ثم استخدمه كالمعتاد تمامًا`,
      },
      {
        name: "torch.distributed.init_process_group",
        signature: "init_process_group(backend='nccl', world_size, rank)",
        kind: "function",
        description: "بوابة التدريب الموزّع: تُهيئ قناة الاتصال بين العمليات/GPUs (NCCL على NVIDIA) — أساس DDP و FSDP.",
        descriptionEn:
          "The gateway to distributed training: initializes the communication channel between processes/GPUs (NCCL on NVIDIA) — the foundation of DDP and FSDP.",
        example: `dist.init_process_group(backend="nccl")\nmodel = DDP(model, device_ids=[rank])`,
      },
    ],
  },
];
