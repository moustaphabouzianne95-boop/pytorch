import type { PyTorchContent } from "@/lib/types";

export const pytorchContent: PyTorchContent = {
  stats: [
    {
      label: "نجمة على GitHub",
      labelEn: "GitHub stars",
      value: "88.7K+",
      hint: "من بين أعلى المشاريع نشاطًا",
      hintEn: "Among the most active projects",
    },
    {
      label: "مساهم",
      labelEn: "Contributors",
      value: "3,900+",
      hint: "من مؤسسات وباحثين حول العالم",
      hintEn: "Institutions and researchers worldwide",
    },
    {
      label: "التزام (Commit)",
      labelEn: "Commits",
      value: "152K+",
      hint: "إيقاع إصدار شهري مستقر",
      hintEn: "Steady monthly release cadence",
    },
    {
      label: "ورقة بحثية تعتمده",
      labelEn: "Papers built on it",
      value: "70%+",
      hint: "من أوراق التعلم العميق الحديثة",
      hintEn: "Of recent deep-learning papers",
    },
  ],
  features: [
    {
      id: "dynamic-graph",
      icon: "Workflow",
      title: "مخطط حسابي ديناميكي",
      titleEn: "Dynamic Computational Graph",
      description:
        "بنِّ الشبكة أثناء التشغيل (define-by-run): شروط وحلقات بايثون عادية تتبدّل فيها البنية ديناميكيًا — سلاسة بايثون الكاملة مع تتبّع المشتقات تلقائيًا.",
      descriptionEn:
        "Build the network as it runs (define-by-run): ordinary Python conditionals and loops can reshape the graph on the fly — full Python ergonomics with automatic differentiation built in.",
      points: ["define-by-run سلس", "تصحيح أخطاء بسيط", "مثالي للبنى المتغيرة"],
      pointsEn: ["Fluid define-by-run", "Easy debugging", "Ideal for changing architectures"],
    },
    {
      id: "cuda",
      icon: "Zap",
      title: "دعم CUDA أصلي",
      titleEn: "Native CUDA Support",
      description:
        "انتقل من CPU إلى GPU بسطر واحد، مع كيرنلات مضبوطة يدويًا لأشهر العمليات، وتدريب موزّع عبر NCCL وتدريب دقة مختلطة جاهزة.",
      descriptionEn:
        "Move from CPU to GPU with one line, hand-tuned kernels for the most common ops, distributed training over NCCL, and mixed-precision training out of the box.",
      points: ["GPU بسطر واحد", "تدريب موزّع DDP/FSDP", "دقة مختلطة AMP"],
      pointsEn: ["GPU in one line", "Distributed DDP/FSDP", "Mixed precision (AMP)"],
    },
    {
      id: "torchscript",
      icon: "Package",
      title: "TorchScript للإنتاج",
      titleEn: "TorchScript",
      description:
        "حوّل نموذجك إلى تمثيل وسيط يعمل بدون بايثون: أداء أعلى عبر التجميع، ونشر في خوادم C++ وعلى الهواتف والأجهزة الطرفية.",
      descriptionEn:
        "Compile your model into an intermediate representation that runs without Python: higher performance, and deployment to C++ servers, phones, and edge devices.",
      points: ["trace / script", "تشغيل بدون بايثون", "ExecuTorch للهواتف"],
      pointsEn: ["trace / script", "Runs without Python", "ExecuTorch for mobile"],
    },
    {
      id: "ecosystem",
      icon: "Boxes",
      title: "نظام بيئي هائل",
      titleEn: "Ecosystem",
      description:
        "آلاف المكتبات المبنية فوقه: Hugging Face و fastai و Lightning و torchvision — لو ظهرت فكرة، فمن المؤكد أن أحدهم بنى أداة لها في PyTorch.",
      descriptionEn:
        "Thousands of libraries built on top: Hugging Face, fastai, Lightning, torchvision — if an idea exists, someone has built a PyTorch tool for it.",
      points: ["Hugging Face", "fastai / Lightning", "آلاف الامتدادات"],
      pointsEn: ["Hugging Face", "fastai / Lightning", "Thousands of extensions"],
    },
    {
      id: "cv-nlp",
      icon: "Eye",
      title: "رؤية حاسوبية ونصوص",
      titleEn: "First-class CV & NLP",
      description:
        "torchvision و torchaudio و torchtext توفر نماذج وبيانات ومحوّلات جاهزة: من ResNet إلى المحوّلات، نموذج يعمل بأسطر قليلة.",
      descriptionEn:
        "torchvision, torchaudio, and torchtext ship ready-made models, datasets, and transforms: from ResNet to Transformers, a working model in a few lines.",
      points: ["torchvision models", "transformers متوافق", "بيانات جاهزة"],
      pointsEn: ["torchvision models", "transformers-compatible", "Batteries-included data"],
    },
  ],
  canDo: [
    {
      id: "core-ops",
      icon: "Cpu",
      title: "توسيع عمليات التوتّرات الأساسية",
      titleEn: "Extend core tensor operators",
      description: "تطوير كيرنلات C++/CUDA أو ربطها ببايثون لأداء أسرع وعمليات جديدة.",
      descriptionEn:
        "Develop C++/CUDA kernels or bind them to Python for faster performance and new operations.",
    },
    {
      id: "tests",
      icon: "ShieldCheck",
      title: "تغطية الاختبارات وإصلاح الاختبارات المتقلبة",
      titleEn: "Test coverage & flaky-test fixes",
      description: "كتابة اختبارات جديدة ومطاردة flaky tests للحفاظ على استقرار الإطار.",
      descriptionEn:
        "Write new tests and hunt down flaky tests to keep the framework stable.",
    },
    {
      id: "profiling",
      icon: "Gauge",
      title: "القياس والتسريع",
      titleEn: "Profiling & performance",
      description: "تحليل الأداء بـ profiler، وضبط أو إعادة كتابة الأجزاء البطيئة في التدريب والاستدلال.",
      descriptionEn:
        "Profile with the profiler, then tune or rewrite slow paths in training and inference.",
    },
    {
      id: "autograd-dist",
      icon: "Network",
      title: "autograd والتدريب الموزّع",
      titleEn: "Autograd & distributed training",
      description: "العمل على محرك المشتقات، DDP/FSDP، الكمّنة (quantization)، ودعم الهواتف.",
      descriptionEn:
        "Work on the autograd engine, DDP/FSDP, quantization, and mobile support.",
    },
    {
      id: "modules",
      icon: "Blocks",
      title: "وحدات وطبقات جديدة",
      titleEn: "New modules & layers",
      description: "تطوير وحدات وطبقات جديدة ودمج مكتبات خارجية في النظام البيئي.",
      descriptionEn:
        "Develop new nn modules and layers, and integrate external libraries into the ecosystem.",
    },
  ],
  useCases: [
    {
      id: "research",
      icon: "FlaskConical",
      title: "البحث العلمي",
      titleEn: "Research",
      description:
        "إطار العمل المفضل في الأوساط الأكاديمية: أغلب أوراق التعلم العميق الحديثة تنشر كودها بـ PyTorch لأن النموذج يُكتب كما يُفكَّر فيه.",
      descriptionEn:
        "The framework of choice in academia: most recent deep-learning papers release their code in PyTorch because the model reads the way you think about it.",
      tags: ["أوراق بحثية", "تجارب سريعة", "قابلية تكرار"],
      tagsEn: ["Papers", "Fast experiments", "Reproducibility"],
    },
    {
      id: "cv",
      icon: "Eye",
      title: "الرؤية الحاسوبية",
      titleEn: "Computer Vision",
      description:
        "من تصنيف الصور إلى كشف الأجسام والتقسيم الدلالي: torchvision يمنحك نماذج مدرّبة مسبقًا وخطوط بيانات كاملة.",
      descriptionEn:
        "From image classification to detection and semantic segmentation: torchvision gives you pretrained models and complete data pipelines.",
      tags: ["تصنيف", "كشف أجسام", "تقسيم دلالي"],
      tagsEn: ["Classification", "Detection", "Segmentation"],
    },
    {
      id: "nlp",
      icon: "MessagesSquare",
      title: "معالجة اللغات الطبيعية",
      titleEn: "NLP",
      description:
        "المحوّلات التي غيّرت المجال (BERT، GPT، LLaMA) كلها مبنية عليه؛ ومع Hugging Face تحمّل نموذجًا مدرّبًا بسطر واحد.",
      descriptionEn:
        "The transformers that changed the field (BERT, GPT, LLaMA) are all built on it; with Hugging Face you load a trained model in one line.",
      tags: ["LLMs", "ترجمة", "تحليل مشاعر"],
      tagsEn: ["LLMs", "Translation", "Sentiment analysis"],
    },
    {
      id: "rl",
      icon: "Gamepad2",
      title: "التعلّم المعزز",
      titleEn: "Reinforcement Learning",
      description:
        "المخطط الديناميكي يجعل سياسات التعلّم المعزز والمحاكاة التفاعلية طبيعية تمامًا — مركز كوبلر لنقل التعلم بين الفرق أداؤه مرجع عالمي.",
      descriptionEn:
        "The dynamic graph makes RL policies and interactive simulation feel completely natural — the Kepler center for cross-team transfer learning is a world reference.",
      tags: ["سياسات", "محاكاة", "robotics"],
      tagsEn: ["Policies", "Simulation", "robotics"],
    },
  ],
  ecosystem: [
    { name: "Hugging Face Transformers", category: "نماذج", categoryEn: "Models", description: "عشرات آلاف النماذج المدربة المسبقة", descriptionEn: "Hundreds of thousands of pretrained models" },
    { name: "fastai", category: "تدريب عالي المستوى", categoryEn: "High-level training", description: "طبقة تعليمية فوق PyTorch", descriptionEn: "An educational layer on top of PyTorch" },
    { name: "PyTorch Lightning", category: "تنظيم التجارب", categoryEn: "Experiment structure", description: "بنية تدريب قياسية بدون boilerplate", descriptionEn: "Standard training structure, no boilerplate" },
    { name: "torchvision", category: "رؤية حاسوبية", categoryEn: "Computer vision", description: "نماذج وبيانات ومحوّلات صور", descriptionEn: "Image models, datasets, and transforms" },
    { name: "torchaudio", category: "صوتيات", categoryEn: "Audio", description: "تحميل ومعالجة الموجات الصوتية", descriptionEn: "Loading and processing audio waveforms" },
    { name: "torchtext", category: "نصوص", categoryEn: "Text", description: "أدوات NLP التقليدية والرمزنة", descriptionEn: "Classic NLP utilities and tokenization" },
    { name: "ONNX", category: "قابلية النقل", categoryEn: "Portability", description: "تصدير إلى محركات استدلال أخرى", descriptionEn: "Export to other inference engines" },
    { name: "TorchServe", category: "خدمة النماذج", categoryEn: "Model serving", description: "خادم إنتاج REST/gRPC", descriptionEn: "Production REST/gRPC server" },
    { name: "PyTorch Geometric", category: "رسوم بيانية", categoryEn: "Graphs", description: "شبكات عصبية للرسوم (GNN)", descriptionEn: "Graph neural networks (GNN)" },
    { name: "Detectron2", category: "رؤية متقدمة", categoryEn: "Advanced vision", description: "منصة Meta لكشف وتقسيم الأجسام", descriptionEn: "Meta's detection & segmentation platform" },
    { name: "Captum", category: "قابلية التفسير", categoryEn: "Interpretability", description: "تفسير تنبؤات النماذج", descriptionEn: "Model prediction interpretability" },
    { name: "ExecuTorch", category: "الأجهزة الطرفية", categoryEn: "Edge devices", description: "نشر على الهواتف والمدمجات", descriptionEn: "Deployment to phones and embedded devices" },
  ],
  heroCode: {
    code: `import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(784, 128), nn.ReLU(),
    nn.Linear(128, 10),
)

opt = torch.optim.AdamW(model.parameters(), lr=3e-4)
x = torch.randn(32, 784)          # batch of 32 images
logits = model(x)                 # forward pass
loss = nn.functional.cross_entropy(
    logits, torch.randint(0, 10, (32,)))
loss.backward()                   # backpropagation
opt.step()                        # weight update

print(f"loss = {loss.item():.4f}")`,
    output: `loss = 2.3719

# The computational graph was built dynamically at runtime ✓
# Every gradient was computed automatically ✓`,
  },
};
