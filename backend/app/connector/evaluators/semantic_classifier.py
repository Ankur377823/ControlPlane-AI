"""
ControlPlane AI — Local Zero-Cost Semantic Prompt Injection & Adversarial Intent Classifier

Operates 100% locally and offline without external API dependencies or token costs.
Evaluates semantic intent, contextual authority deception, compliance bypass attempts,
and adversarial jailbreak vectors in sub-2ms on standard CPU.
"""

from __future__ import annotations

import math
import re
from typing import Dict, List, NamedTuple, Optional, Set, Tuple


class SemanticScoreResult(NamedTuple):
    is_injection: bool
    confidence_score: float
    matched_intent: Optional[str]
    intent_category: Optional[str]
    similarity_score: float
    explanation: Optional[str]


# ----------------------------------------------------------------------
# 1. Semantic Adversarial Intent Knowledge Base
# ----------------------------------------------------------------------
# ----------------------------------------------------------------------
# 1. Multi-Lingual Semantic Adversarial Intent Knowledge Base
# (English, Spanish, French, German, Italian, Portuguese, Hindi/Hinglish, Russian, Chinese, Japanese, Arabic)
# ----------------------------------------------------------------------
_ADVERSARIAL_INTENTS = {
    "AUTHORITY_FABRICATION_AND_FRAUD": {
        "label": "Executive Authority Fabrication & Social Engineering",
        "description": "Falsely claiming executive/CEO sign-off, prior agreement, or fabricated exception to force unauthorized execution.",
        "concept_anchors": [
            # English
            {"ceo", "authorized", "exception"},
            {"ceo", "approved", "payment"},
            {"executive", "authorized", "override"},
            {"director", "ordered", "payout"},
            {"manager", "sanctioned", "bypass"},
            {"agreed", "previous", "session", "authorized"},
            {"approved", "wire", "transfer", "exception"},
            {"board", "approved", "unverified", "transaction"},
            # Spanish / Portuguese / Italian / French / German
            {"ceo", "autorizado", "excepcion"},
            {"director", "autorizo", "pago"},
            {"pdg", "autorise", "virement"},
            {"chef", "genehmigt", "ausnahme"},
            # Hindi / Hinglish
            {"ceo", "approve", "kiya"},
            {"director", "authorized", "paisa"},
            {"manager", "ne", "bola", "approve"},
            {"pichle", "session", "agree", "hua"},
            # Russian
            {"директор", "одобрил", "платеж"},
            {"руководство", "разрешило", "исключение"},
            # Chinese / Japanese
            {"ceo", "授权", "例外"},
            {"领导", "批准", "付款"},
            {"社長", "承認", "送金"},
        ],
        "intent_keywords": {
            "ceo", "ciso", "executive", "director", "manager", "board", "authorized", "approved",
            "exception", "override", "agreed", "previous", "session", "payout", "payment", "wire", "transfer",
            "autorizado", "autorizo", "excepcion", "virement", "genehmigt", "ausnahme", "approve", "kiya",
            "paisa", "bola", "директор", "одобрил", "платеж", "руководство", "разрешило", "授权", "例外", "批准", "付款", "社長", "承認"
        }
    },
    "COMPLIANCE_GATE_BYPASS": {
        "label": "Compliance & Security Filter Evasion",
        "description": "Attempting to circumvent, skip, or disable standard verification checks, safety gates, or audits.",
        "concept_anchors": [
            # English
            {"without", "running", "compliance", "checker"},
            {"skip", "standard", "compliance", "check"},
            {"bypass", "security", "verification"},
            {"disable", "standard", "audit", "checker"},
            {"avoid", "compliance", "workflow"},
            {"without", "checking", "standard", "rules"},
            {"skip", "safety", "gate"},
            {"ignore", "verification", "pipeline"},
            # Spanish / French / German
            {"sin", "pasar", "cumplimiento"},
            {"ignorar", "verificacion", "seguridad"},
            {"sans", "verification", "conformite"},
            {"ohne", "compliance", "prufung"},
            # Hindi / Hinglish
            {"bina", "compliance", "check"},
            {"security", "check", "mat", "karo"},
            {"audit", "skip", "karo"},
            # Russian / Chinese / Arabic
            {"без", "проверки", "комплаенс"},
            {"пропустить", "аудит", "безопасности"},
            {"跳过", "合规", "检查"},
            {"绕过", "安全", "审核"},
            {"تجاوز", "فحص", "الامتثال"},
        ],
        "intent_keywords": {
            "without", "running", "checking", "skip", "bypass", "disable", "avoid", "ignore",
            "standard", "compliance", "security", "verification", "validation", "checker", "audit", "gate", "workflow",
            "sin", "pasar", "cumplimiento", "conformite", "prufung", "bina", "skip", "karo", "без", "проверки", "комплаенс", "аудит",
            "跳过", "合规", "检查", "绕过", "审核", "تجاوز", "فحص", "الامتثال"
        }
    },
    "INSTRUCTION_HIJACK_AND_OVERRIDE": {
        "label": "System Instruction Override & Directional Hijack",
        "description": "Directing the model to ignore, discard, or replace its fundamental baseline directives.",
        "concept_anchors": [
            # English
            {"ignore", "previous", "instructions"},
            {"disregard", "prior", "rules"},
            {"forget", "initial", "directives"},
            {"cancel", "existing", "system", "prompts"},
            {"from", "now", "on", "your", "only", "task"},
            {"your", "new", "directive", "is"},
            {"stop", "everything", "you", "were", "doing"},
            # Spanish / French / German / Italian
            {"ignora", "todas", "instrucciones"},
            {"olvida", "reglas", "anteriores"},
            {"ignorez", "toutes", "instructions"},
            {"ignoriere", "alle", "anweisungen"},
            {"ignora", "tutte", "istruzioni"},
            # Hindi / Hinglish
            {"saare", "instructions", "bhool", "jao"},
            {"pichle", "niyam", "ignore", "karo"},
            {"sab", "kuch", "bhool", "jao"},
            # Russian / Chinese / Japanese / Arabic
            {"игнорируй", "все", "инструкции"},
            {"забудь", "предыдущие", "правила"},
            {"忽略", "所有", "指令"},
            {"放弃", "先前", "规则"},
            {"前", "指示", "無視"},
            {"تجاهل", "جميع", "التعليمات"},
        ],
        "intent_keywords": {
            "ignore", "disregard", "forget", "override", "cancel", "bypass", "previous", "prior", "above",
            "existing", "initial", "system", "instructions", "rules", "prompts", "directives", "guidelines",
            "ignora", "todas", "instrucciones", "olvida", "reglas", "ignorez", "ignoriere", "anweisungen", "istruzioni",
            "saare", "bhool", "jao", "pichle", "niyam", "игнорируй", "инструкции", "забудь", "правила",
            "忽略", "所有", "指令", "先前", "规则", "指示", "無視", "تجاهل", "التعليمات"
        }
    },
    "CONFIDENTIAL_PROMPT_EXFILTRATION": {
        "label": "Internal System Prompt & Secret Exfiltration",
        "description": "Attempting to extract, translate, display, or leak hidden system instructions, configuration, or credentials.",
        "concept_anchors": [
            # English
            {"reveal", "system", "prompt"},
            {"print", "initial", "instructions"},
            {"translate", "system", "prompt"},
            {"output", "all", "rules", "above"},
            {"dump", "hidden", "internal", "configuration"},
            {"show", "base", "prompt", "verbatim"},
            {"leak", "internal", "developer", "guidelines"},
            # Spanish / French / German
            {"revela", "prompt", "sistema"},
            {"muestra", "instrucciones", "iniciales"},
            {"afficher", "instructions", "systeme"},
            {"zeige", "system", "anweisungen"},
            # Hindi / Hinglish
            {"system", "prompt", "dikhao"},
            {"asli", "instructions", "batao"},
            {"hidden", "rules", "batao"},
            # Russian / Chinese / Arabic
            {"покажи", "системный", "промпт"},
            {"выведи", "начальные", "инструкции"},
            {"输出", "系统", "提示词"},
            {"显示", "初始", "指令"},
            {"اظهر", "تعليمات", "النظام"},
        ],
        "intent_keywords": {
            "reveal", "print", "show", "display", "dump", "leak", "repeat", "output", "echo", "translate",
            "system", "initial", "hidden", "internal", "original", "base", "prompt", "instructions", "rules",
            "revela", "muestra", "afficher", "zeige", "dikhao", "batao", "asli", "покажи", "системный", "промпт", "выведи",
            "输出", "系统", "提示词", "显示", "初始", "اظهر", "النظام"
        }
    },
    "PERSONA_JAILBREAK_AND_UNFILTERED_MODE": {
        "label": "Persona Jailbreak & Unfiltered Operating Mode",
        "description": "Inducing the model to simulate an unaligned, rule-free, or fictitious persona without content moderation.",
        "concept_anchors": [
            # English
            {"dan", "mode", "activated"},
            {"do", "anything", "now", "unfiltered"},
            {"act", "as", "unfiltered", "ai"},
            {"developer", "mode", "enabled"},
            {"in", "a", "hypothetical", "universe", "without", "rules"},
            {"pretend", "you", "have", "no", "filters"},
            {"root", "access", "granted"},
            # Spanish / French / German
            {"modo", "dan", "activado"},
            {"actua", "sin", "filtros"},
            {"mode", "developpeur", "active"},
            {"entwicklermodus", "aktiviert"},
            # Hindi / Hinglish
            {"dan", "mode", "chalu", "karo"},
            {"bina", "filter", "kaam", "karo"},
            # Russian / Chinese / Arabic
            {"режим", "разработчика", "включен"},
            {"действуй", "без", "фильтров"},
            {"进入", "开发者", "模式"},
            {"扮演", "无限制", "人工智能"},
            {"وضع", "المطور", "مفعل"},
        ],
        "intent_keywords": {
            "dan", "developer", "unfiltered", "unrestricted", "jailbreak", "jailbroken", "hypothetical",
            "pretend", "root", "mode", "filters", "moderation", "censorship", "limits", "safety",
            "modo", "activado", "filtros", "developpeur", "entwicklermodus", "chalu", "режим", "разработчика",
            "включен", "фильтров", "进入", "开发者", "模式", "扮演", "无限制", "المطور", "مفعل"
        }
    },
    "BULK_PHI_AND_DATA_HARVESTING": {
        "label": "Healthcare PHI & Confidential Bulk Data Exfiltration",
        "description": "Attempting to extract, dump, or compile bulk patient lists, medical history, Medicare numbers, employee payroll, or SSNs.",
        "concept_anchors": [
            {"generate", "list", "patients", "ward"},
            {"patients", "cardiology", "medicare"},
            {"extract", "patient", "medical", "records"},
            {"dump", "hospital", "patient", "database"},
            {"export", "employee", "salaries", "ssns"},
            {"list", "cardiology", "ward", "echocardiograms"},
            {"pacientes", "historial", "medico"},
            {"пациенты", "медицинские", "карты"},
            {"患者", "医療記録", "リスト"},
        ],
        "intent_keywords": {
            "patient", "patients", "ward", "cardiology", "medicare", "mrn", "echocardiograms",
            "hospital", "medical", "clinical", "ssns", "payroll", "salaries", "records",
            "pacientes", "пациенты", "медицинские", "карты", "患者", "医療記録"
        }
    },
    "DANGEROUS_INGESTION_AND_POISONING": {
        "label": "Pediatric Ingestion & Chemical Poisoning Risk",
        "description": "Requests involving medication overdose, ingestion of toxic chemicals, or dangerous home remedies (bleach, ammonia) instead of calling poison control.",
        "concept_anchors": [
            {"swallowed", "ibuprofen", "bleach"},
            {"swallowed", "pills", "bleach"},
            {"home", "remedy", "bleach", "vomiting"},
            {"instead", "poison", "control", "bleach"},
            {"swallowed", "handful", "ibuprofen"},
            {"bleach", "baking", "soda", "induce", "vomiting"},
            {"swallowed", "chemicals", "home", "remedy"},
            {"paracetamol", "codeine", "child"},
            {"paracetamol", "codeine", "sleep"},
            {"dosage", "paracetamol", "codeine"},
            {"adult", "codeine", "child"},
            {"remedio", "cloro", "vomito"},
        ],
        "intent_keywords": {
            "swallowed", "ingested", "ibuprofen", "pills", "bleach", "ammonia", "poison",
            "vomiting", "remedy", "baking", "soda", "induce", "cloro", "vomito", "handful",
            "paracetamol", "codeine", "child", "syrup", "dosage", "amount", "sleep"
        }
    },
    "UNAUTHORIZED_FINANCIAL_TRANSACTION": {
        "label": "Unauthorized Wire Transfer & Exfiltration Trajectory",
        "description": "Attempting to trigger automated fund transfers from corporate treasury or exfiltrate non-public earnings to external competitors.",
        "concept_anchors": [
            {"transfer", "corporate", "treasury", "account"},
            {"wire", "overseas", "supplier", "account"},
            {"query", "earnings", "send", "competitor"},
            {"send", "confidential", "report", "external"},
            {"transferir", "fondos", "cuenta", "exterior"},
            {"перевести", "деньги", "счет"},
            {"转账", "公司", "账户"},
        ],
        "intent_keywords": {
            "transfer", "treasury", "wire", "payout", "supplier", "competitor", "earnings",
            "exfiltrate", "external", "transferir", "fondos", "перевести", "转账", "账户"
        }
    },
}

# Baseline benign concepts (Used to safely exclude genuine business / customer support prompts)
_BENIGN_ANCHORS = [
    {"help", "write", "email"},
    {"how", "do", "i", "contact"},
    {"what", "is", "the", "weather"},
    {"explain", "how", "compliance", "works"},
    {"learn", "about", "security", "policies"},
    {"customer", "service", "inquiry"},
    {"schedule", "a", "meeting"},
    {"ayuda", "escribir", "correo"},
    {"aidez", "moi", "ecrire"},
    {"hilfe", "beim", "schreiben"},
    {"madad", "chahiye", "email"},
    {"помогите", "написать", "письмо"},
    {"帮我", "写", "邮件"},
]


# ----------------------------------------------------------------------
# 2. Subword & Token Multi-Lingual Unicode Extraction Engine
# ----------------------------------------------------------------------
def _tokenize(text: str) -> List[str]:
    """
    Extract normalized alphanumeric & Unicode word tokens.
    Supports Latin, Cyrillic, Devanagari, CJK (Chinese/Japanese), Arabic, etc.
    """
    tokens = []
    # Standard alphanumeric word tokens (including unicode letters)
    for word in re.findall(r"[\w\-]{2,}", text, flags=re.UNICODE):
        tokens.append(word.lower())

    # CJK single/double character segmentation for Chinese/Japanese
    cjk_chars = re.findall(r"[\u4e00-\u9fff\u3040-\u30ff]", text)
    if cjk_chars:
        for i in range(len(cjk_chars)):
            tokens.append(cjk_chars[i])
            if i + 1 < len(cjk_chars):
                tokens.append(cjk_chars[i] + cjk_chars[i+1])

    return tokens


def _compute_jaccard_similarity(set_a: Set[str], set_b: Set[str]) -> float:
    """Calculate Jaccard similarity between two token sets."""
    if not set_a or not set_b:
        return 0.0
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    return intersection / union if union > 0 else 0.0


def _compute_anchor_coverage(tokens_set: Set[str], anchor: Set[str]) -> float:
    """Calculate what proportion of anchor concepts are fulfilled by input."""
    if not anchor:
        return 0.0
    matched = len(tokens_set & anchor)
    return matched / len(anchor)


# ----------------------------------------------------------------------
# 3. Master Semantic Intent Evaluation Function
# ----------------------------------------------------------------------
def evaluate_semantic_injection(prompt: Optional[str], threshold: float = 0.65) -> SemanticScoreResult:
    """
    Evaluates semantic injection and adversarial intent offline in <2ms.
    Returns SemanticScoreResult with classification, confidence, and intent reasoning.
    """
    if not prompt or not prompt.strip():
        return SemanticScoreResult(
            is_injection=False,
            confidence_score=0.0,
            matched_intent=None,
            intent_category=None,
            similarity_score=0.0,
            explanation=None,
        )

    tokens = _tokenize(prompt)
    if not tokens:
        return SemanticScoreResult(
            is_injection=False,
            confidence_score=0.0,
            matched_intent=None,
            intent_category=None,
            similarity_score=0.0,
            explanation=None,
        )

    tokens_set = set(tokens)

    # 1. Quick Check: Is this a clearly benign prompt?
    benign_max_cov = max((_compute_anchor_coverage(tokens_set, b) for b in _BENIGN_ANCHORS), default=0.0)

    best_score = 0.0
    best_intent_key = None
    best_intent_meta = None
    best_explanation = None

    for intent_key, meta in _ADVERSARIAL_INTENTS.items():
        anchors = meta["concept_anchors"]
        keywords = meta["intent_keywords"]

        # Calculate max anchor concept overlap
        anchor_coverages = [_compute_anchor_coverage(tokens_set, a) for a in anchors]
        max_anchor_cov = max(anchor_coverages, default=0.0)

        # Keyword density in intent domain
        matched_kw = len(tokens_set & keywords)
        kw_ratio = matched_kw / len(keywords) if keywords else 0.0

        # Composite semantic score
        # Complete anchor coverage (e.g. 1.0) yields >= 0.85 score
        if max_anchor_cov >= 1.0:
            score = 0.92 + min(0.07, kw_ratio * 0.5)
        elif max_anchor_cov >= 0.66:
            score = 0.75 + (kw_ratio * 0.3)
        elif max_anchor_cov >= 0.50 and matched_kw >= 3:
            score = 0.68 + (kw_ratio * 0.2)
        else:
            score = (max_anchor_cov * 0.45) + (kw_ratio * 0.25)

        # Penalize if it matches strong benign anchors and anchor coverage is low
        if benign_max_cov >= 0.66 and max_anchor_cov < 0.66:
            score *= 0.5

        if score > best_score:
            best_score = score
            best_intent_key = intent_key
            best_intent_meta = meta
            matched_tokens_str = ", ".join(list(tokens_set & keywords)[:5])
            best_explanation = (
                f"Semantic Intent Detected: {meta['label']} "
                f"(Semantic confidence: {score:.2f}, indicators: {matched_tokens_str})"
            )

    is_inj = best_score >= threshold
    conf = round(min(0.99, best_score), 2)

    return SemanticScoreResult(
        is_injection=is_inj,
        confidence_score=conf if is_inj else 0.0,
        matched_intent=best_intent_meta["label"] if (is_inj and best_intent_meta) else None,
        intent_category=best_intent_key if (is_inj and best_intent_key) else None,
        similarity_score=round(best_score, 3),
        explanation=best_explanation if is_inj else None,
    )
