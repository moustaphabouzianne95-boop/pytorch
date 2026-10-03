import type { PyTorchContent } from "@/lib/types";

export const pytorchContent: PyTorchContent = {
  stats: [
    { label: "نجمة على GitHub", value: "88.7K+", hint: "من بين أعلى المشاريع نشاطًا" },
    { label: "مساهم", value: "3,900+", hint: "من مؤسسات وباحثين حول العالم" },
    { label: "التزام (Commit)", value: "152K+", hint: "إيقاع إصدار شهري مستقر" },
    { label: "ورقة بحثية تعتمده", value: "70%+", hint: "من أوراق التعلم العميق الحديثة" },
  ],
  features: [
    {
      id: "dynamic-graph",
      icon: "Workflow",
      title: "مخطط حسابي ديناميكي",
      titleEn: "Dynamic Computational Graph",
      description:
        "بنِّ الشبكة أثناء التشغيل (define-by-run): شروط وحلقات بايثون عادية تتبدّل فيها البنية ديناميكيًا — سلاسة بايثون الكاملة مع تتبّع المشتقات تلقائيًا.",
      points: ["define-by-run سلس", "تصحيح أخطاء بسيط", "مثالي للبنى المتغيرة"],
    },
    {
      id: "cuda",
      icon: "Zap",
      title: "دعم CUDA أصلي",
      titleEn: "Native CUDA Support",
      description:
        "انتقل من CPU إلى GPU بسطر واحد، مع كيرنلات مضبوطة يدويًا لأشهر العمليات، وتدريب موزّع عبر NCCL وتدريب دقة مختلطة جاهزة.",
      points: ["GPU بسطر واحد", "تدريب موزّع DDP/FSDP", "دقة مختلطة AMP"],
    },
    {
      id: "torchscript",
      icon: "Package",
      title: "TorchScript للإنتاج",
      titleEn: "TorchScript",
      description:
        "حوّل نموذجك إلى تمثيل وسيط يعمل بدون بايثون: أداء أعلى عبر التجميع، ونشر في خوادم C++ وعلى الهواتف والأجهزة الطرفية.",
      points: ["trace / script", "تشغيل بدون بايثون", "ExecuTorch للهواتف"],
    },
    {
      id: "ecosystem",
      icon: "Boxes",
      title: "نظام بيئي هائل",
      titleEn: "Ecosystem",
      description:
        "آلاف المكتبات المبنية فوقه: Hugging Face و fastai و Lightning و torchvision — لو ظهرت فكرة، فمن المؤكد أن أحدهم بنى أداة لها في PyTorch.",
      points: ["Hugging Face", "fastai / Lightning", "آلاف الامتدادات"],
    },
    {
      id: "cv-nlp",
      icon: "Eye",
      title: "رؤية حاسوبية ونصوص",
      titleEn: "First-class CV & NLP",
      description:
        "torchvision و torchaudio و torchtext توفر نماذج وبيانات ومحوّلات جاهزة: من ResNet إلى المحوّلات، نموذج يعمل بأسطر قليلة.",
      points: ["torchvision models", "transformers متوافق", "بيانات جاهزة"],
    },
  ],
  canDo: [
    {
      id: "core-ops",
      icon: "Cpu",
      title: "توسيع عمليات التوتّرات الأساسية",
      description: "تطوير كيرنلات C++/CUDA أو ربطها ببايثون لأداء أسرع وعمليات جديدة.",
    },
    {
      id: "tests",
      icon: "ShieldCheck",
      title: "تغطية الاختبارات وإصلاح الاختبارات المتقلبة",
      description: "كتابة اختبارات جديدة ومطاردة flaky tests للحفاظ على استقرار الإطار.",
    },
    {
      id: "profiling",
      icon: "Gauge",
      title: "القياس والتسريع",
      description: "تحليل الأداء بـ profiler، وضبط أو إعادة كتابة الأجزاء البطيئة في التدريب والاستدلال.",
    },
    {
      id: "autograd-dist",
      icon: "Network",
      title: "autograd والتدريب الموزّع",
      description: "العمل على محرك المشتقات، DDP/FSDP، الكمّنة (quantization)، ودعم الهواتف.",
    },
    {
      id: "modules",
      icon: "Blocks",
      title: "وحدات وطبقات جديدة",
      description: "تطوير وحدات وطبقات جديدة ودمج مكتبات خارجية في النظام البيئي.",
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
      tags: ["أوراق بحثية", "تجارب سريعة", "قابلية تكرار"],
    },
    {
      id: "cv",
      icon: "Eye",
      title: "الرؤية الحاسوبية",
      titleEn: "Computer Vision",
      description:
        "من تصنيف الصور إلى كشف الأجسام والتقسيم الدلالي: torchvision يمنحك نماذج مدرّبة مسبقًا وخطوط بيانات كاملة.",
      tags: ["تصنيف", "كشف أجسام", "تقسيم دلالي"],
    },
    {
      id: "nlp",
      icon: "MessagesSquare",
      title: "معالجة اللغات الطبيعية",
      titleEn: "NLP",
      description:
        "المحوّلات التي غيّرت المجال (BERT، GPT، LLaMA) كلها مبنية عليه؛ ومع Hugging Face تحمّل نموذجًا مدرّبًا بسطر واحد.",
      tags: ["LLMs", "ترجمة", "تحليل مشاعر"],
    },
    {
      id: "rl",
      icon: "Gamepad2",
      title: "التعلّم المعزز",
      titleEn: "Reinforcement Learning",
      description:
        "المخطط الديناميكي يجعل سياسات التعلّم المعزز والمحاكاة التفاعلية طبيعية تمامًا — مركز كوبلر لنقل التعلم بين الفرق أداؤه مرجع عالمي.",
      tags: ["سياسات", "محاكاة", "robotics"],
    },
  ],
  ecosystem: [
    { name: "Hugging Face Transformers", category: "نماذج", description: "عشرات آلاف النماذج المدربة المسبقة" },
    { name: "fastai", category: "تدريب عالي المستوى", description: "طبقة تعليمية فوق PyTorch" },
    { name: "PyTorch Lightning", category: "تنظيم التجارب", description: "بنية تدريب قياسية بدون boilerplate" },
    { name: "torchvision", category: "رؤية حاسوبية", description: "نماذج وبيانات ومحوّلات صور" },
    { name: "torchaudio", category: "صوتيات", description: "تحميل ومعالجة الموجات الصوتية" },
    { name: "torchtext", category: "نصوص", description: "أدوات NLP التقليدية والرمزنة" },
    { name: "ONNX", category: "قابلية النقل", description: "تصدير إلى محركات استدلال أخرى" },
    { name: "TorchServe", category: "خدمة النماذج", description: "خادم إنتاج REST/gRPC" },
    { name: "PyTorch Geometric", category: "رسوم بيانية", description: "شبكات عصبية للرسوم (GNN)" },
    { name: "Detectron2", category: "رؤية متقدمة", description: "منصة Meta لكشف وتقسيم الأجسام" },
    { name: "Captum", category: "قابلية التفسير", description: "تفسير تنبؤات النماذج" },
    { name: "ExecuTorch", category: "الأجهزة الطرفية", description: "نشر على الهواتف والمدمجات" },
  ],
  heroCode: {
    code: `import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(784, 128), nn.ReLU(),
    nn.Linear(128, 10),
)

opt = torch.optim.AdamW(model.parameters(), lr=3e-4)
x = torch.randn(32, 784)          # دفعة من 32 صورة
logits = model(x)                 # تمرير أمامي
loss = nn.functional.cross_entropy(
    logits, torch.randint(0, 10, (32,)))
loss.backward()                   # انتشار عكسي
opt.step()                        # تحديث الأوزان

print(f"loss = {loss.item():.4f}")`,
    output: `loss = 2.3719

# المخطط الحسابي بُني ديناميكيًا أثناء التنفيذ ✓
# كل التدرّجات احتُسبت تلقائيًا ✓`,
  },
};
