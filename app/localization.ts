"use client";

import { useEffect } from "react";

export type AppLocale = "en" | "zh" | "ur";

const zh: Record<string, string> = {
  "Back": "返回", "Close": "关闭", "Done": "完成", "All": "全部", "Rules": "规则", "Live now": "正在直播",
  "Live conversations": "实时语音", "Voice rooms": "语音房", "Search rooms": "搜索房间", "For you": "为你推荐", "Music": "音乐", "Games": "游戏", "New": "最新", "Stories · Open mic": "故事 · 开放麦克风", "Music · Requests": "音乐 · 点歌", "Ludo · Friendly": "Ludo · 友谊局", "Poetry · Culture": "诗歌 · 文化", "Friends are here": "好友在这里", "+ Start a room": "+ 创建房间",
  "Leave room": "离开房间", "More options": "更多选项", "Host · Karachi": "主持人 · 卡拉奇", "Following": "已关注", "Follow": "关注", "Say salaam…": "说声你好…", "Send": "发送", "Invite": "邀请", "Unmute": "取消静音", "Mute": "静音", "Gift": "礼物", "Leave": "离开", "Send a room gift": "赠送房间礼物", "Send a moment": "送出心意", "Gift animation stays brief and never blocks the room controls.": "礼物动画简洁呈现，不会遮挡房间控制。",
  "Made for your night": "为你的夜晚精选", "Discover": "发现", "Search discover": "搜索发现内容", "Drama": "短剧", "People": "用户", "Rooms": "房间", "Tonight’s premiere": "今晚首播", "Watch now": "立即观看", "Continue watching": "继续观看", "People you may like": "你可能喜欢的人", "3 mutual friends": "3 位共同好友", "Episode 02": "第 02 集", "5:18 left": "剩余 5:18",
  "Share episode": "分享剧集", "Pause episode": "暂停剧集", "Play episode": "播放剧集", "Episode 04 · Urdu / English subtitles": "第 04 集 · 乌尔都语 / 英文字幕", "Some truths only arrive after sunset.": "有些真相，只在日落后抵达。", "Playing": "播放中", "Paused": "已暂停", "Secrets after sunset": "日落后的秘密", "Rida returns to Karachi with a letter that changes everything between her and Amaan.": "Rida 带着一封信回到卡拉奇，改变了她与 Amaan 之间的一切。", "Join discussion room": "加入讨论房", "Follow series": "关注剧集", "Saved": "已收藏", "Save": "收藏", "Episodes": "剧集", "A quiet arrival": "安静的归来", "The unopened letter": "未拆的信", "Between two homes": "两个家之间", "The return": "归来", "Locked": "未解锁",
  "Play together": "一起玩", "Game lounge": "游戏大厅", "Game history": "游戏记录", "6 friends are playing": "6 位好友正在游戏", "Ludo Nights": "Ludo 之夜", "Classic rules · 2–4 players": "经典规则 · 2–4 人", "Play now": "立即开始", "Quick games": "快速游戏", "Carrom Club": "弹棋俱乐部", "2–4 players": "2–4 人", "Quiz Bazaar": "问答集市", "Fast trivia": "快速问答", "Cricket Dash": "板球冲刺", "Live challenge": "实时挑战", "Friends playing": "好友正在玩", "Join": "加入", "Leave game": "离开游戏", "Restart game": "重新开始", "Friendly match · Round": "友谊赛 · 第", "You": "你", "pts": "分", "Your turn": "轮到你", "Roll the dice": "掷骰子", "Waiting for the next move": "等待下一步", "Rolling…": "掷骰中…", "Nice move!": "好棋！",
  "Your circle": "你的圈子", "Inbox": "消息", "New message": "新消息", "Messages": "消息", "Requests": "请求", "Activity": "动态", "That room was so fun ✨": "那个房间太有趣了 ✨", "Ludo rematch tonight?": "今晚再来一局 Ludo？", "Sent you a voice note": "给你发了一条语音", "Yesterday": "昨天", "Met in Urdu Poetry Circle": "在乌尔都诗歌圈认识", "Accept": "接受", "Added": "已添加", "Marketplace order pending": "市场订单处理中", "Mission reward ready": "任务奖励已就绪", "Security check complete": "安全检查完成", "No action required": "无需操作", "Maira sent you a gift": "Maira 给你送了礼物", "Online now": "当前在线", "Today": "今天", "Read": "已读", "Message…": "输入消息…", "Start voice call": "发起语音通话", "Send quick gift": "赠送快捷礼物", "Send message": "发送消息",
  "Your SADA": "你的 SADA", "Profile": "个人中心", "Profile settings": "个人设置", "Friends": "好友", "Followers": "粉丝", "Edit profile": "编辑资料", "Activity center": "活动中心", "3 rewards are ready": "3 个奖励待领取", "Wallet": "钱包", "Diamonds": "钻石", "Store": "商店", "Gifts & styles": "礼物与装扮", "Marketplace": "交易市场", "Trade eligible collectibles": "交易符合条件的收藏品", "VIP membership": "VIP 会员", "Level": "等级", "Notifications": "通知", "Safety & privacy": "安全与隐私", "Protected": "已保护", "Partner center": "合作伙伴中心", "Grade A": "A 级", "Preview onboarding": "预览新手流程", "Language": "语言", "English": "英文",
  "Clear and protected": "清晰且受保护", "Diamond balance": "钻石余额", "Recharge currency · Store, gifts and premium experiences": "充值货币 · 用于商店、礼物和高级体验", "Recharge": "充值", "Game Coin": "游戏币", "Earned": "已获得", "Pending": "处理中", "Frozen": "冻结", "Growth": "成长", "Two currencies, separate purposes": "两种货币，各有用途", "Diamonds are purchased for premium experiences. Game Coin is earned through valid activity and powers the player marketplace. They cannot be directly exchanged.": "钻石用于购买高级体验；游戏币通过有效活动获得并用于玩家市场。两者不能直接兑换。", "Recent activity": "近期记录", "Welcome reward": "欢迎奖励", "Released · Today": "已发放 · 今天", "Ludo mission": "Ludo 任务", "Store · Today": "商店 · 今天", "VIP monthly pack": "VIP 月度礼包", "Secure recharge": "安全充值", "Choose a Diamond pack": "选择钻石礼包", "Final amount and payment method are always shown before confirmation.": "确认前始终显示最终金额与支付方式。",
  "Prestige benefits": "尊享权益", "Current status": "当前状态", "Benefit preview": "权益预览", "Level upgraded": "等级已提升", "Upgrade to VIP 4": "升级至 VIP 4", "active": "已启用", "Preview selected": "已选择预览", "benefits": "权益", "Identity badge": "身份徽章", "Daily pack": "每日礼包", "store discount": "商店折扣", "Entrance effect": "入场特效", "More listings": "更多上架位", "Premium frame": "高级头像框", "Priority support": "优先支持", "Room theme": "房间主题", "Event priority": "活动优先", "Signature suite": "专属套装", "Dedicated care": "专属服务", "Identity and recognition": "身份与认可", "Service and convenience": "服务与便利", "Fair marketplace value": "公平的市场价值", "VIP improves identity, service and convenience. It never changes game odds, grants unlimited Coin or bypasses risk control.": "VIP 提升身份、服务与便利，但不会改变游戏概率、提供无限游戏币或绕过风控。",
  "Curated for you": "为你精选", "SADA Store": "SADA 商店", "Featured": "精选", "Frames": "头像框", "Gifts": "礼物", "Rides": "座驾", "Featured frame": "精选头像框", "Try it on your profile": "在个人资料中试用", "View piece": "查看商品", "Permanent": "永久", "Giftable": "可赠送", "Tradable": "可交易", "Bound": "绑定", "Limited": "限量", "Eligible items show trading and gifting status before purchase.": "符合条件的商品会在购买前显示交易与赠送状态。", "Try": "试用", "Get": "获取",
  "Season 01 · Night Society": "第 01 季 · 夜间社群", "New member journey": "新成员旅程", "Tonight belongs to your crew.": "今晚属于你的好友团。", "Complete voice, friend and game moments to unlock the Emerald Welcome Frame.": "完成语音、好友与游戏任务，解锁翡翠欢迎头像框。", "of 5 milestones": "/ 5 个里程碑", "Seven-day check-in": "七日签到", "Effective online time": "有效在线时长", "18 min today": "今天 18 分钟", "Claimed": "已领取", "Claim": "领取", "Daily": "每日", "Social": "社交", "Stay in a voice room": "停留在语音房", "Add a new friend": "添加新好友", "Play valid matches": "完成有效对局", "Send a room gift": "赠送房间礼物", "Play with a friend": "与好友一起玩", "Three-day friendship streak": "连续三天好友互动", "Follow a room host": "关注房主", "Complete one valid match": "完成一场有效对局", "Complete three matches": "完成三场对局", "Complete five matches": "完成五场对局", "Only effective activity counts. Background idling, repeated matches and suspicious multi-account behavior are excluded.": "仅计算有效活动；后台挂机、重复对局及可疑多账号行为不计入。",
  "Player-to-player exchange": "玩家交易", "Market": "市场", "My listings": "我的上架", "Orders": "订单", "Trading unlocked": "交易已解锁", "Your collection can travel.": "让你的收藏流通起来。", "List eligible frames, fragments and limited gifts. Bound rewards cannot be traded.": "可上架符合条件的头像框、碎片和限量礼物，绑定奖励不可交易。", "List an item": "上架商品", "No market orders yet.": "暂无市场订单。", "Completed, pending and risk-reviewed orders will appear here.": "已完成、处理中和风控审核订单会显示在这里。", "Game Coin and Diamond never convert directly. Suspicious pricing, repeated transfers and high-value orders may be delayed or reviewed.": "游戏币与钻石不可直接兑换。异常定价、重复转移和高价值订单可能被延迟或审核。", "Seller": "卖家", "Allowed price range": "允许价格范围", "Platform fee is paid by the seller.": "平台费用由卖家承担。", "Buy for": "购买", "Eligible inventory": "可上架库存", "Price in Game Coin": "游戏币价格", "Submit listing": "提交上架",
  "Account & community": "账号与社区", "Safety center": "安全中心", "Your account is protected.": "你的账号已受到保护。", "Recent sign-in, payment and trading checks show no action required.": "近期登录、支付与交易检查均显示无需操作。", "Privacy controls": "隐私控制", "Private account": "私密账号", "Approve new followers manually": "手动批准新关注者", "Message protection": "消息保护", "Filter suspicious links and abuse": "过滤可疑链接与辱骂", "Blocked accounts": "已屏蔽账号", "accounts": "个账号", "Help & reporting": "帮助与举报", "Report content or a user": "举报内容或用户", "Room, message, profile, game or drama": "房间、消息、资料、游戏或短剧", "Appeals & case status": "申诉与案件状态", "Evidence and decisions remain available": "证据与处理结果将持续可查", "Age and wellbeing": "年龄与健康", "18+ controls, time reminders and support": "18+ 控制、时长提醒与支持", "Marketplace protection": "市场保护", "Report received": "举报已收到", "Confidential report": "保密举报", "What happened?": "发生了什么？", "Harassment or hate": "骚扰或仇恨", "Sexual or violent content": "色情或暴力内容", "Scam or payment issue": "诈骗或支付问题", "Copyright concern": "版权问题", "Details": "详细信息", "Submit report": "提交举报",
  "Invite-only ecosystem": "仅限受邀的生态", "Games": "游戏", "Release pipeline": "发布流程", "Step": "步骤", "Identity": "身份", "Rights": "权利", "Sandbox": "沙盒", "Review": "审核", "Limited release": "限量发布", "Revenue share": "收入分成", "Next settlement": "下次结算", "Required controls": "必要控制", "Verified": "已验证", "Action required before release": "发布前需要处理", "Submit for limited release": "提交限量发布", "Review submitted": "已提交审核", "Partners receive only necessary anonymized data. SADA retains control of accounts, payments, ranking, moderation and enforcement.": "合作伙伴仅接收必要的匿名数据；SADA 保留账号、支付、排名、审核与执行控制权。",
  "Find your people.": "找到与你同频的人。", "Live conversations, playful nights and stories worth sharing.": "实时交流、欢乐夜晚，以及值得分享的故事。", "Continue with phone": "使用手机号继续", "I already have an account": "我已有账号", "Welcome to SADA": "欢迎来到 SADA", "Phone number": "手机号码", "Send code": "发送验证码", "Start with your crew.": "从好友团开始。", "Enter a voice room": "进入语音房", "Add your first friend": "添加第一位好友", "Play one Ludo round": "玩一局 Ludo", "Complete": "完成", "Tap to complete demo": "点击完成演示", "Claim reward & enter SADA": "领取奖励并进入 SADA",
  "My collection":"我的收藏","Items, tags and equipment":"道具、标签与装备","Owned items & status":"拥有的道具与状态","items":"件道具","Tradable value":"可交易价值","Bound rewards":"绑定奖励","Expiring soon":"即将到期","Items":"道具","Equipped":"已装备","Use":"使用","Combine":"合成","Owned":"已拥有","Open player marketplace":"打开玩家交易市场","Recycle":"回收","Equip / use":"装备 / 使用","Send gift":"赠送礼物","Recyclable":"可回收","30 days":"30 天","7 days":"7 天",
  "30-day launch journey":"30 天上线旅程","Day 9":"第 9 天","Cold start":"冷启动","Habit building":"习惯养成","Economy & content":"经济与内容","Active":"进行中","Next":"下一阶段","Crew leaderboard":"好友团排行榜","Top 20":"前 20","Reward controls":"奖励控制","Live limits":"实时上限","Daily output":"每日产出","Hourly output":"每小时产出","Valid matches":"有效对局","Reward rate":"奖励比例","Settlement queue":"结算队列","Releases in 12 min":"12 分钟后到账","Releases tomorrow":"明日到账","Standard review":"标准审核","New member reward":"新人奖励","Marketplace sale":"市场出售"
  ,"Five guided moments unlock your 80 Diamond welcome pack.":"完成五个引导步骤即可解锁 80 钻石欢迎礼包。","Enter a recommended voice room":"进入推荐语音房","Speak or follow the host":"发言或关注房主","Browse the SADA Store":"浏览 SADA 商店","Complete ten matches":"完成十场对局","Rare fragment":"稀有碎片","Utility":"功能道具","Packs":"礼包","Featured collection":"精选系列",
  "Platform systems":"平台系统","All mind-map modules":"全部思维导图模块","Mind-map implementation":"思维导图落地","Complete product map":"完整产品地图","Four loops, one operating system.":"四大闭环，一套运营系统。","Every branch from the SADA plan is available as a drill-down prototype.":"SADA 策划案的每个分支均已制作为可逐级查看的原型。","loops":"闭环","modules":"模块","rules":"规则","System modules":"系统模块","Prototype coverage":"原型覆盖","reviewed":"已检查","controls":"控制项","Review complete":"检查完成","Run full module review":"执行完整模块检查",
  "Growth and activity":"增长与活动","Economy, store and VIP":"经济、商城与 VIP","Open partner ecosystem":"开放合作生态","Risk, governance and data":"风控、治理与数据","New-user journey":"新用户旅程","Activity system":"活动系统","30-day cadence":"30 天运营节奏","Growth metrics":"增长指标","Dual currencies":"双币体系","Store catalog":"商城商品体系","Player marketplace":"玩家交易市场","VIP 1–10":"VIP 1–10","Game developers":"游戏开发商","Drama studios":"短剧工作室","Partner console":"合作方后台","Platform control boundary":"平台控制边界","Game output controls":"游戏产出控制","Trade and payment risk":"交易与支付风控","Settlement control":"结算控制","Content safety":"内容安全","Partner governance":"合作方治理","Data monitoring":"数据监控",
  "Search SADA":"搜索 SADA","People, rooms and moments":"用户、房间与精彩时刻","Search people, rooms, games or drama":"搜索用户、房间、游戏或短剧","Clear search":"清除搜索","results":"个结果","View":"查看","Play":"开始游戏","Watch":"观看","SADA profile":"SADA 用户资料","Message":"发消息","Together on SADA":"在 SADA 的共同经历","Live together now":"正在同一房间","mutual friends are listening":"位共同好友正在收听","Recent moments":"最近动态","Invite friends":"邀请好友","Bring your people to SADA":"邀请好友加入 SADA","Invites sent":"邀请已发送","friends received your private SADA invite.":"位好友已收到你的 SADA 私密邀请。","Done":"完成","Your invite link":"你的邀请链接","Copy":"复制","Suggested contacts":"推荐联系人","selected":"已选择","Phone contacts":"手机联系人","Send":"发送","invite":"份邀请","invites":"份邀请","Create a room":"创建房间","Start a live conversation":"开始实时对话","Room preview":"房间预览","Ready to go live":"可以开播了","Room title":"房间名称","Topic":"主题","Stories":"故事","Poetry":"诗歌","Who can join":"谁可以加入","Public":"公开","Friends only":"仅好友","Preview room":"预览房间","Go live":"开始直播","Store bag and purchased items":"商城购物袋与已购商品","Saved":"已收藏","History":"记录","Equipped":"已装备","Use":"使用","Current level":"当前等级","VIP benefits":"VIP 权益","Prestige without unfair advantage":"尊贵体验，不影响公平","Signature frame":"专属头像框","Priority support":"优先客服","Lower fees":"更低手续费","Host presence":"房主专属装扮","Upgrade to VIP 4":"升级至 VIP 4","Confirm upgrade":"确认升级","VIP 4 activated":"VIP 4 已开通","Edit profile":"编辑资料","Identity and preferences":"身份与偏好设置","Change photo":"更换头像","Display name":"显示名称","Bio":"个人简介","City":"城市","Save changes":"保存修改","Game history":"游戏记录","Recent matches and performance":"最近对局与表现","matches":"场对局","wins":"场胜利","win rate":"胜率","Play again":"再玩一局","Invite to the room":"邀请加入房间","Room controls":"房间控制","Share room":"分享房间","Room notifications":"房间通知","Report room":"举报房间",
  "Payments & billing":"支付与账单","Recharge, receipts and refunds":"充值、回执与退款","Pakistan · PKR":"巴基斯坦 · PKR","Payments":"支付中心","Receipts":"支付回执","Choose a Diamond pack":"选择钻石充值包","Bonus is bound":"赠送钻石为绑定资产","Payment method":"支付方式","Manage":"管理","Secure payment":"安全支付","OTP protection · Clear PKR total · Automatic receipt":"OTP 保护 · 明确 PKR 金额 · 自动保存回执","Review payment":"核对支付订单","No hidden charges":"无隐藏费用","Diamond recharge":"钻石充值","Purchased Diamonds":"购买钻石","Channel fee":"通道费用","Included":"已包含","Tax":"税费","Total to pay":"应付总额","SADA protected payment":"SADA 支付保护","Continue securely":"安全继续","Preview failed payment state":"查看支付失败状态","Verify payment":"验证支付","Enter the 6-digit code":"输入 6 位验证码","One-time code":"一次性验证码","Resend code":"重新发送验证码","Daily recharge limit":"每日充值限额","Confirming payment":"正在确认支付","Payment successful":"支付成功","Diamonds added":"钻石已到账","New balance":"最新余额","View receipt":"查看支付回执","Return to Wallet":"返回钱包","Payment history":"支付记录","Receipts and support":"回执与客服支持","Successful this month":"本月支付成功","Refund review":"退款审核中","Payment receipt":"支付回执","Purchase protection":"购买保护","Request refund or report a problem":"申请退款或报告问题","Refund request":"退款申请","What happened?":"遇到了什么问题？","Purchase made by mistake":"误操作购买","Diamonds not received":"钻石未到账","Duplicate payment":"重复支付","Payment not authorized":"非本人授权支付","Before you submit":"提交前请确认","Submit refund request":"提交退款申请","Payment not completed":"支付未完成","No money was charged":"未扣除任何款项","Try again":"重新尝试","Change pack or method":"更换充值包或支付方式","Order status":"订单状态","Declined":"已拒绝","Payment methods":"支付方式管理","Saved securely":"安全保存","Your payment details stay protected":"你的支付信息受到保护","Add payment method":"添加支付方式","Mobile wallet":"手机钱包","Bank card":"银行卡","Save and use method":"保存并使用","Cancel":"取消","Default":"默认","Use":"使用","Provider-protected setup":"支付服务商安全设置","Demo mode: no banking details leave this device and no real charge is created.":"演示模式：银行信息不会离开本机，也不会产生真实扣款。"
};

Object.assign(zh, {
  "SADA stores provider tokens, never your full card or wallet credentials.": "SADA 仅保存支付服务商令牌，不会保存完整银行卡或钱包凭证。",
  "Payment method added and selected": "支付方式已添加并选中",
  "Payment method removed": "支付方式已移除",
  "Pakistan mobile number": "巴基斯坦手机号码",
  "Card number": "银行卡号",
  "Verification continues with your mobile wallet provider.": "验证将在你的手机钱包服务商处继续。",
  "Only the last four digits are retained in this prototype.": "此原型仅保留卡号后四位。",
  "Use the number registered with your wallet.": "请输入钱包注册手机号码。",
  "A real integration will use Stripe Checkout or Payment Element tokenization.": "正式接入将使用 Stripe Checkout 或 Payment Element 令牌化。",
});

Object.assign(zh, {
  "Complete operation flows": "完整操作流程",
  "13 end-to-end product journeys": "13 条端到端产品流程",
  "complete flows": "条完整流程",
  "Operation steps": "操作步骤",
  "with system feedback": "包含系统反馈",
  "Every step includes": "每一步包含",
  "action, response, rule, exception": "动作、反馈、规则、异常",
  "User flow": "用户流程",
  "User": "用户",
  "Commerce flow": "商业化流程",
  "Commerce": "商业化",
  "Partner flow": "合作方流程",
  "Partner": "合作方",
  "Governance flow": "治理流程",
  "Governance": "治理",
  "flow": "流程",
  "steps": "步",
  "How to review this prototype": "如何查看本原型",
  "Open a flow to step through user action, SADA response, business rule and exception handling. The final button opens the corresponding interactive product screen.": "打开任一流程，可逐步查看用户动作、SADA 反馈、业务规则和异常处理；最后可进入对应的交互页面。",
  "Current product moment": "当前产品环节",
  "User action": "用户动作",
  "SADA response": "SADA 系统反馈",
  "Business and safety rule": "业务与安全规则",
  "Exception branch": "异常分支",
  "Previous": "上一步",
  "Next step": "下一步",
  "Complete flow": "完成流程",
  "View all exception branches": "查看全部异常分支",
  "Exception and recovery paths": "异常与恢复路径",
  "End-to-end path reviewed": "端到端流程已检查",
  "Primary flow, product response, control rule and exception branches have been covered.": "主流程、产品反馈、控制规则和异常分支均已覆盖。",
  "Review again": "重新检查",
  "Open interactive screen": "打开交互页面",
  "New user activation": "新用户激活",
  "Friendship and private chat": "好友关系与私聊",
  "Voice room listener": "语聊房听众流程",
  "Voice room host": "语聊房主持流程",
  "Social game session": "社交游戏流程",
  "Drama discovery and unlock": "短剧发现与解锁",
  "Recharge and payment recovery": "充值与支付恢复",
  "Store purchase and VIP": "商城购买与 VIP",
  "Marketplace trade": "交易所交易",
  "Game developer publishing": "游戏开发商上架",
  "Drama studio publishing": "短剧工作室上架",
  "Report, block and appeal": "举报、拉黑与申诉",
  "Customer support case": "客服工单流程"
  ,"From phone verification to first social relationship": "从手机验证到建立第一段社交关系"
  ,"Discover, request, accept, chat and play together": "发现用户、发送请求、接受、聊天并共同游戏"
  ,"Enter, interact, speak, gift and leave safely": "进入、互动、上麦、送礼并安全离开"
  ,"Create, moderate and close a live room": "创建、管理并结束实时语聊房"
  ,"Match, play, settle rewards and rematch": "匹配、游戏、奖励结算与再来一局"
  ,"Watch, unlock, follow and discuss a series": "观看、解锁、追更并讨论短剧"
  ,"Select pack, pay, receive assets and resolve exceptions": "选择礼包、支付、资产到账并处理异常"
  ,"Preview, recharge if needed, purchase and equip": "预览、按需充值、购买并装备"
  ,"List, buy, risk-check and settle a collectible": "上架、购买、风控检查与收藏品结算"
  ,"Apply, integrate, review, launch and settle": "申请、接入、审核、发布与结算"
  ,"Upload rights, episodes, subtitles and release schedule": "上传版权、剧集、字幕与发行计划"
  ,"Protect the user while preserving due process": "保护用户并保留完整处置与申诉程序"
  ,"Self-service, ticket, resolution and feedback": "自助服务、工单、解决与反馈"
});

const ur: Record<string, string> = {
  "Back":"واپس","Close":"بند کریں","Done":"مکمل","All":"سب","Rules":"قواعد","Live now":"ابھی لائیو","Live conversations":"لائیو گفتگو","Voice rooms":"وائس رومز","Search rooms":"روم تلاش کریں","For you":"آپ کے لیے","Music":"موسیقی","Games":"گیمز","New":"نیا","Friends are here":"دوست یہاں ہیں","+ Start a room":"+ روم شروع کریں","Leave room":"روم چھوڑیں","More options":"مزید اختیارات","Host · Karachi":"میزبان · کراچی","Following":"فالو کیا ہوا","Follow":"فالو کریں","Say salaam…":"سلام کہیں…","Send":"بھیجیں","Invite":"دعوت دیں","Unmute":"آواز کھولیں","Mute":"خاموش","Gift":"تحفہ","Leave":"چھوڑیں","Send a room gift":"روم تحفہ بھیجیں","Send a moment":"ایک لمحہ بھیجیں",
  "Made for your night":"آپ کی رات کے لیے","Discover":"دریافت","Drama":"ڈرامہ","People":"لوگ","Rooms":"رومز","Tonight’s premiere":"آج رات کا پریمیئر","Watch now":"ابھی دیکھیں","Continue watching":"دیکھنا جاری رکھیں","People you may like":"وہ لوگ جو آپ کو پسند آ سکتے ہیں","3 mutual friends":"3 مشترکہ دوست","Episode 02":"قسط 02","5:18 left":"5:18 باقی",
  "Share episode":"قسط شیئر کریں","Pause episode":"قسط روکیں","Play episode":"قسط چلائیں","Episode 04 · Urdu / English subtitles":"قسط 04 · اردو / انگریزی سب ٹائٹلز","Some truths only arrive after sunset.":"کچھ سچ غروب آفتاب کے بعد آتے ہیں۔","Playing":"چل رہا ہے","Paused":"رکا ہوا","Secrets after sunset":"غروب آفتاب کے بعد کے راز","Join discussion room":"گفتگو کے روم میں شامل ہوں","Follow series":"سیریز فالو کریں","Saved":"محفوظ","Save":"محفوظ کریں","Episodes":"اقساط","A quiet arrival":"خاموش آمد","The unopened letter":"بند خط","Between two homes":"دو گھروں کے درمیان","The return":"واپسی","Locked":"مقفل",
  "Play together":"ساتھ کھیلیں","Game lounge":"گیم لاؤنج","Game history":"گیم ریکارڈ","6 friends are playing":"6 دوست کھیل رہے ہیں","Ludo Nights":"لوڈو نائٹس","Classic rules · 2–4 players":"کلاسک قواعد · 2–4 کھلاڑی","Play now":"ابھی کھیلیں","Quick games":"فوری گیمز","2–4 players":"2–4 کھلاڑی","Fast trivia":"تیز سوالات","Live challenge":"لائیو چیلنج","Friends playing":"کھیلتے دوست","Join":"شامل ہوں","Leave game":"گیم چھوڑیں","Restart game":"گیم دوبارہ شروع کریں","Friendly match · Round":"دوستانہ میچ · راؤنڈ","You":"آپ","pts":"پوائنٹس","Your turn":"آپ کی باری","Roll the dice":"پانسہ پھینکیں","Waiting for the next move":"اگلی چال کا انتظار","Rolling…":"پانسہ چل رہا ہے…","Nice move!":"اچھی چال!",
  "Your circle":"آپ کا حلقہ","Inbox":"پیغامات","New message":"نیا پیغام","Messages":"پیغامات","Requests":"درخواستیں","Activity":"سرگرمی","That room was so fun ✨":"وہ روم بہت مزے کا تھا ✨","Ludo rematch tonight?":"آج رات لوڈو دوبارہ؟","Sent you a voice note":"آپ کو وائس نوٹ بھیجا","Yesterday":"کل","Accept":"قبول کریں","Added":"شامل","Marketplace order pending":"مارکیٹ آرڈر زیر التوا","Mission reward ready":"مشن انعام تیار","Security check complete":"سیکیورٹی چیک مکمل","No action required":"کسی کارروائی کی ضرورت نہیں","Online now":"ابھی آن لائن","Today":"آج","Read":"پڑھا گیا","Message…":"پیغام…","Start voice call":"وائس کال شروع کریں","Send quick gift":"فوری تحفہ بھیجیں","Send message":"پیغام بھیجیں",
  "Your SADA":"آپ کا SADA","Profile":"پروفائل","Profile settings":"پروفائل سیٹنگز","Friends":"دوست","Followers":"فالوورز","Edit profile":"پروفائل میں ترمیم","Activity center":"سرگرمی مرکز","3 rewards are ready":"3 انعامات تیار ہیں","Wallet":"والیٹ","Diamonds":"ڈائمنڈز","Store":"اسٹور","Gifts & styles":"تحائف اور اسٹائل","Marketplace":"مارکیٹ پلیس","Trade eligible collectibles":"اہل کلیکٹیبلز کی تجارت","VIP membership":"VIP رکنیت","Level":"لیول","Notifications":"اطلاعات","Safety & privacy":"حفاظت اور رازداری","Protected":"محفوظ","Partner center":"پارٹنر سینٹر","Grade A":"گریڈ A","Preview onboarding":"آن بورڈنگ دیکھیں","Language":"زبان","English":"انگریزی",
  "Clear and protected":"واضح اور محفوظ","Diamond balance":"ڈائمنڈ بیلنس","Recharge":"ری چارج","Game Coin":"گیم کوائن","Earned":"حاصل شدہ","Pending":"زیر التوا","Frozen":"منجمد","Growth":"ترقی","Two currencies, separate purposes":"دو کرنسیاں، الگ مقاصد","Recent activity":"حالیہ سرگرمی","Welcome reward":"خوش آمدیدی انعام","Released · Today":"جاری · آج","Ludo mission":"لوڈو مشن","Secure recharge":"محفوظ ری چارج","Choose a Diamond pack":"ڈائمنڈ پیک منتخب کریں",
  "Prestige benefits":"اعزازی فوائد","Current status":"موجودہ حیثیت","Benefit preview":"فوائد کا جائزہ","Level upgraded":"لیول اپ گریڈ","Upgrade to VIP 4":"VIP 4 پر اپ گریڈ","active":"فعال","Preview selected":"جائزہ منتخب","benefits":"فوائد","Identity badge":"شناختی بیج","Daily pack":"روزانہ پیک","Entrance effect":"داخلے کا ایفیکٹ","More listings":"مزید لسٹنگز","Premium frame":"پریمیم فریم","Priority support":"ترجیحی مدد","Room theme":"روم تھیم","Event priority":"ایونٹ ترجیح","Signature suite":"خصوصی سوٹ","Dedicated care":"خصوصی نگہداشت","Identity and recognition":"شناخت اور پہچان","Service and convenience":"سروس اور سہولت","Fair marketplace value":"منصفانہ مارکیٹ قدر",
  "Curated for you":"آپ کے لیے منتخب","SADA Store":"SADA اسٹور","Featured":"نمایاں","Frames":"فریمز","Gifts":"تحائف","Rides":"رائیڈز","Featured frame":"نمایاں فریم","Try it on your profile":"پروفائل پر آزمائیں","View piece":"آئٹم دیکھیں","Permanent":"مستقل","Giftable":"قابل تحفہ","Tradable":"قابل تجارت","Bound":"منسلک","Limited":"محدود","Try":"آزمائیں","Get":"حاصل کریں",
  "Season 01 · Night Society":"سیزن 01 · نائٹ سوسائٹی","New member journey":"نئے رکن کا سفر","Tonight belongs to your crew.":"آج رات آپ کے دوستوں کی ہے۔","Seven-day check-in":"سات روزہ چیک اِن","Effective online time":"موثر آن لائن وقت","18 min today":"آج 18 منٹ","Claimed":"وصول شدہ","Claim":"وصول کریں","Daily":"روزانہ","Social":"سماجی","Stay in a voice room":"وائس روم میں رہیں","Add a new friend":"نیا دوست شامل کریں","Play valid matches":"درست میچ کھیلیں","Play with a friend":"دوست کے ساتھ کھیلیں","Follow a room host":"روم میزبان کو فالو کریں","Complete one valid match":"ایک درست میچ مکمل کریں","Complete three matches":"تین میچ مکمل کریں","Complete five matches":"پانچ میچ مکمل کریں",
  "Player-to-player exchange":"کھلاڑیوں کی تجارت","Market":"مارکیٹ","My listings":"میری لسٹنگز","Orders":"آرڈرز","Trading unlocked":"تجارت کھلی ہے","Your collection can travel.":"آپ کا مجموعہ آگے بڑھ سکتا ہے۔","List an item":"آئٹم لسٹ کریں","No market orders yet.":"ابھی کوئی مارکیٹ آرڈر نہیں۔","Seller":"فروخت کنندہ","Allowed price range":"اجازت یافتہ قیمت","Buy for":"خریدیں","Eligible inventory":"اہل انوینٹری","Price in Game Coin":"گیم کوائن میں قیمت","Submit listing":"لسٹنگ جمع کریں",
  "Account & community":"اکاؤنٹ اور کمیونٹی","Safety center":"حفاظتی مرکز","Your account is protected.":"آپ کا اکاؤنٹ محفوظ ہے۔","Privacy controls":"رازداری کنٹرولز","Private account":"نجی اکاؤنٹ","Approve new followers manually":"نئے فالوورز دستی طور پر منظور کریں","Message protection":"پیغام تحفظ","Filter suspicious links and abuse":"مشکوک لنکس اور بدسلوکی فلٹر کریں","Blocked accounts":"بلاک اکاؤنٹس","accounts":"اکاؤنٹس","Help & reporting":"مدد اور رپورٹنگ","Report content or a user":"مواد یا صارف رپورٹ کریں","Appeals & case status":"اپیل اور کیس کی حیثیت","Age and wellbeing":"عمر اور بہبود","Marketplace protection":"مارکیٹ تحفظ","Report received":"رپورٹ موصول","Confidential report":"خفیہ رپورٹ","What happened?":"کیا ہوا؟","Harassment or hate":"ہراسانی یا نفرت","Sexual or violent content":"جنسی یا پرتشدد مواد","Scam or payment issue":"فراڈ یا ادائیگی مسئلہ","Copyright concern":"کاپی رائٹ مسئلہ","Details":"تفصیلات","Submit report":"رپورٹ جمع کریں",
  "Invite-only ecosystem":"صرف دعوتی نظام","Release pipeline":"ریلیز مراحل","Step":"مرحلہ","Identity":"شناخت","Rights":"حقوق","Sandbox":"سینڈ باکس","Review":"جائزہ","Limited release":"محدود ریلیز","Revenue share":"آمدنی کا حصہ","Next settlement":"اگلی ادائیگی","Required controls":"ضروری کنٹرولز","Verified":"تصدیق شدہ","Action required before release":"ریلیز سے پہلے کارروائی ضروری","Submit for limited release":"محدود ریلیز کے لیے جمع کریں","Review submitted":"جائزہ جمع ہو گیا",
  "Find your people.":"اپنے لوگوں کو تلاش کریں۔","Continue with phone":"فون کے ساتھ جاری رکھیں","I already have an account":"میرا اکاؤنٹ پہلے سے ہے","Welcome to SADA":"SADA میں خوش آمدید","Phone number":"فون نمبر","Send code":"کوڈ بھیجیں","Start with your crew.":"اپنے دوستوں کے ساتھ شروع کریں۔","Enter a voice room":"وائس روم میں جائیں","Add your first friend":"پہلا دوست شامل کریں","Play one Ludo round":"لوڈو کا ایک راؤنڈ کھیلیں","Complete":"مکمل","Tap to complete demo":"ڈیمو مکمل کرنے کے لیے ٹیپ کریں","Claim reward & enter SADA":"انعام لیں اور SADA میں داخل ہوں",
  "My collection":"میرا مجموعہ","Items, tags and equipment":"آئٹمز، ٹیگز اور سامان","Owned items & status":"ملکیتی آئٹمز اور حیثیت","items":"آئٹمز","Tradable value":"قابل تجارت قدر","Bound rewards":"منسلک انعامات","Expiring soon":"جلد ختم ہونے والے","Items":"آئٹمز","Equipped":"استعمال میں","Use":"استعمال کریں","Combine":"جوڑیں","Owned":"ملکیت","Open player marketplace":"کھلاڑی مارکیٹ کھولیں","Recycle":"ری سائیکل","Equip / use":"استعمال کریں","Send gift":"تحفہ بھیجیں","Recyclable":"قابل ری سائیکل","30 days":"30 دن","7 days":"7 دن",
  "30-day launch journey":"30 روزہ لانچ سفر","Day 9":"دن 9","Cold start":"ابتدائی آغاز","Habit building":"عادت سازی","Economy & content":"معیشت اور مواد","Active":"فعال","Next":"اگلا","Crew leaderboard":"دوستوں کی درجہ بندی","Top 20":"ٹاپ 20","Reward controls":"انعام کنٹرولز","Live limits":"لائیو حدود","Daily output":"روزانہ پیداوار","Hourly output":"فی گھنٹہ پیداوار","Valid matches":"درست میچ","Reward rate":"انعام کی شرح","Settlement queue":"سیٹلمنٹ قطار","Releases in 12 min":"12 منٹ میں جاری","Releases tomorrow":"کل جاری","Standard review":"معیاری جائزہ","New member reward":"نئے رکن کا انعام","Marketplace sale":"مارکیٹ فروخت"
  ,"Five guided moments unlock your 80 Diamond welcome pack.":"پانچ رہنمائی مراحل مکمل کر کے 80 ڈائمنڈ خوش آمدیدی پیک حاصل کریں۔","Enter a recommended voice room":"تجویز کردہ وائس روم میں جائیں","Speak or follow the host":"بات کریں یا میزبان کو فالو کریں","Browse the SADA Store":"SADA اسٹور دیکھیں","Complete ten matches":"دس میچ مکمل کریں","Rare fragment":"نایاب ٹکڑا","Utility":"کارآمد اشیاء","Packs":"پیکس","Featured collection":"نمایاں مجموعہ",
  "Platform systems":"پلیٹ فارم سسٹمز","All mind-map modules":"تمام مائنڈ میپ ماڈیولز","Mind-map implementation":"مائنڈ میپ نفاذ","Complete product map":"مکمل پروڈکٹ نقشہ","Four loops, one operating system.":"چار حلقے، ایک آپریٹنگ سسٹم۔","Every branch from the SADA plan is available as a drill-down prototype.":"SADA پلان کی ہر شاخ تفصیلی پروٹوٹائپ میں دستیاب ہے۔","loops":"حلقے","modules":"ماڈیولز","rules":"قواعد","System modules":"سسٹم ماڈیولز","Prototype coverage":"پروٹوٹائپ کوریج","reviewed":"جائزہ شدہ","controls":"کنٹرولز","Review complete":"جائزہ مکمل","Run full module review":"مکمل ماڈیول جائزہ چلائیں",
  "Growth and activity":"ترقی اور سرگرمی","Economy, store and VIP":"معیشت، اسٹور اور VIP","Open partner ecosystem":"اوپن پارٹنر ایکو سسٹم","Risk, governance and data":"خطرہ، نظم اور ڈیٹا","New-user journey":"نئے صارف کا سفر","Activity system":"سرگرمی سسٹم","30-day cadence":"30 روزہ ترتیب","Growth metrics":"ترقی کے اشاریے","Dual currencies":"دو کرنسیاں","Store catalog":"اسٹور کیٹلاگ","Player marketplace":"کھلاڑی مارکیٹ","VIP 1–10":"VIP 1–10","Game developers":"گیم ڈویلپرز","Drama studios":"ڈرامہ اسٹوڈیوز","Partner console":"پارٹنر کنسول","Platform control boundary":"پلیٹ فارم کنٹرول حدود","Game output controls":"گیم آؤٹ پٹ کنٹرول","Trade and payment risk":"تجارت اور ادائیگی خطرہ","Settlement control":"سیٹلمنٹ کنٹرول","Content safety":"مواد کی حفاظت","Partner governance":"پارٹنر نظم","Data monitoring":"ڈیٹا مانیٹرنگ",
  "Search SADA":"SADA تلاش کریں","People, rooms and moments":"لوگ، رومز اور لمحات","Search people, rooms, games or drama":"لوگ، رومز، گیمز یا ڈرامہ تلاش کریں","Clear search":"تلاش صاف کریں","results":"نتائج","View":"دیکھیں","Play":"کھیلیں","Watch":"دیکھیں","SADA profile":"SADA پروفائل","Message":"پیغام","Together on SADA":"SADA پر ساتھ","Live together now":"ابھی ساتھ لائیو","mutual friends are listening":"مشترکہ دوست سن رہے ہیں","Recent moments":"حالیہ لمحات","Invite friends":"دوستوں کو بلائیں","Bring your people to SADA":"اپنے دوستوں کو SADA پر لائیں","Invites sent":"دعوتیں بھیج دی گئیں","friends received your private SADA invite.":"دوستوں کو آپ کی نجی SADA دعوت ملی۔","Done":"مکمل","Your invite link":"آپ کا دعوتی لنک","Copy":"کاپی","Suggested contacts":"تجویز کردہ رابطے","selected":"منتخب","Phone contacts":"فون رابطے","Send":"بھیجیں","invite":"دعوت","invites":"دعوتیں","Create a room":"روم بنائیں","Start a live conversation":"لائیو گفتگو شروع کریں","Room preview":"روم پیش نظارہ","Ready to go live":"لائیو ہونے کے لیے تیار","Room title":"روم کا نام","Topic":"موضوع","Stories":"کہانیاں","Poetry":"شاعری","Who can join":"کون شامل ہو سکتا ہے","Public":"عوامی","Friends only":"صرف دوست","Preview room":"روم دیکھیں","Go live":"لائیو جائیں","Store bag and purchased items":"اسٹور بیگ اور خریدی اشیاء","Saved":"محفوظ","History":"ریکارڈ","Equipped":"استعمال میں","Use":"استعمال کریں","Current level":"موجودہ لیول","VIP benefits":"VIP فوائد","Prestige without unfair advantage":"وقار، بغیر غیر منصفانہ فائدے","Signature frame":"خصوصی فریم","Priority support":"ترجیحی مدد","Lower fees":"کم فیس","Host presence":"میزبان کی شناخت","Upgrade to VIP 4":"VIP 4 پر اپ گریڈ","Confirm upgrade":"اپ گریڈ کی تصدیق","VIP 4 activated":"VIP 4 فعال ہو گیا","Edit profile":"پروفائل میں ترمیم","Identity and preferences":"شناخت اور ترجیحات","Change photo":"تصویر بدلیں","Display name":"ظاہری نام","Bio":"تعارف","City":"شہر","Save changes":"تبدیلیاں محفوظ کریں","Game history":"گیم ریکارڈ","Recent matches and performance":"حالیہ میچ اور کارکردگی","matches":"میچ","wins":"جیت","win rate":"جیت کی شرح","Play again":"دوبارہ کھیلیں","Invite to the room":"روم میں مدعو کریں","Room controls":"روم کنٹرولز","Share room":"روم شیئر کریں","Room notifications":"روم اطلاعات","Report room":"روم رپورٹ کریں",
  "Payments & billing":"ادائیگی اور بلنگ","Recharge, receipts and refunds":"ری چارج، رسیدیں اور ریفنڈ","Pakistan · PKR":"پاکستان · PKR","Payments":"ادائیگیاں","Receipts":"رسیدیں","Choose a Diamond pack":"ڈائمنڈ پیک منتخب کریں","Bonus is bound":"بونس ڈائمنڈ منسلک ہیں","Payment method":"ادائیگی کا طریقہ","Manage":"انتظام کریں","Secure payment":"محفوظ ادائیگی","OTP protection · Clear PKR total · Automatic receipt":"OTP تحفظ · واضح PKR رقم · خودکار رسید","Review payment":"ادائیگی چیک کریں","No hidden charges":"کوئی پوشیدہ چارج نہیں","Diamond recharge":"ڈائمنڈ ری چارج","Purchased Diamonds":"خریدے گئے ڈائمنڈز","Channel fee":"چینل فیس","Included":"شامل","Tax":"ٹیکس","Total to pay":"کل قابل ادائیگی","SADA protected payment":"SADA محفوظ ادائیگی","Continue securely":"محفوظ طریقے سے جاری رکھیں","Preview failed payment state":"ناکام ادائیگی دیکھیں","Verify payment":"ادائیگی کی تصدیق","Enter the 6-digit code":"6 ہندسوں کا کوڈ درج کریں","One-time code":"ایک بار کا کوڈ","Resend code":"کوڈ دوبارہ بھیجیں","Daily recharge limit":"روزانہ ری چارج حد","Confirming payment":"ادائیگی کی تصدیق ہو رہی ہے","Payment successful":"ادائیگی کامیاب","Diamonds added":"ڈائمنڈز شامل ہو گئے","New balance":"نیا بیلنس","View receipt":"رسید دیکھیں","Return to Wallet":"والیٹ پر واپس جائیں","Payment history":"ادائیگی ریکارڈ","Receipts and support":"رسیدیں اور مدد","Successful this month":"اس ماہ کامیاب","Refund review":"ریفنڈ زیر جائزہ","Payment receipt":"ادائیگی رسید","Purchase protection":"خریداری کا تحفظ","Request refund or report a problem":"ریفنڈ یا مسئلہ رپورٹ کریں","Refund request":"ریفنڈ درخواست","What happened?":"کیا ہوا؟","Purchase made by mistake":"غلطی سے خریداری","Diamonds not received":"ڈائمنڈز موصول نہیں ہوئے","Duplicate payment":"دہری ادائیگی","Payment not authorized":"غیر مجاز ادائیگی","Before you submit":"جمع کرنے سے پہلے","Submit refund request":"ریفنڈ درخواست جمع کریں","Payment not completed":"ادائیگی مکمل نہیں ہوئی","No money was charged":"کوئی رقم نہیں کٹی","Try again":"دوبارہ کوشش کریں","Change pack or method":"پیک یا طریقہ بدلیں","Order status":"آرڈر کی حیثیت","Declined":"مسترد","Payment methods":"ادائیگی کے طریقے","Saved securely":"محفوظ طریقے سے محفوظ","Your payment details stay protected":"آپ کی ادائیگی کی تفصیلات محفوظ ہیں","Add payment method":"ادائیگی کا طریقہ شامل کریں","Mobile wallet":"موبائل والیٹ","Bank card":"بینک کارڈ","Save and use method":"محفوظ کریں اور استعمال کریں","Cancel":"منسوخ","Default":"ڈیفالٹ","Use":"استعمال کریں","Provider-protected setup":"فراہم کنندہ کی محفوظ ترتیب","Demo mode: no banking details leave this device and no real charge is created.":"ڈیمو موڈ: بینک تفصیلات اس ڈیوائس سے باہر نہیں جاتیں اور کوئی حقیقی چارج نہیں ہوتا۔"
};

Object.assign(ur, {
  "SADA stores provider tokens, never your full card or wallet credentials.": "SADA صرف فراہم کنندہ کے ٹوکن محفوظ کرتا ہے، مکمل کارڈ یا والیٹ معلومات نہیں۔",
  "Payment method added and selected": "ادائیگی کا طریقہ شامل اور منتخب ہو گیا",
  "Payment method removed": "ادائیگی کا طریقہ ہٹا دیا گیا",
  "Pakistan mobile number": "پاکستانی موبائل نمبر",
  "Card number": "کارڈ نمبر",
  "Verification continues with your mobile wallet provider.": "تصدیق آپ کے موبائل والیٹ فراہم کنندہ کے ساتھ جاری رہے گی۔",
  "Only the last four digits are retained in this prototype.": "اس پروٹوٹائپ میں صرف آخری چار ہندسے رکھے جاتے ہیں۔",
  "Use the number registered with your wallet.": "اپنے والیٹ کے ساتھ رجسٹرڈ نمبر استعمال کریں۔",
  "A real integration will use Stripe Checkout or Payment Element tokenization.": "حقیقی انضمام Stripe Checkout یا Payment Element ٹوکنائزیشن استعمال کرے گا۔",
  "Complete operation flows": "مکمل عملی مراحل",
  "13 end-to-end product journeys": "13 مکمل پروڈکٹ سفر",
  "complete flows": "مکمل فلو",
  "Operation steps": "عملی مراحل",
  "with system feedback": "سسٹم فیڈبیک کے ساتھ",
  "Every step includes": "ہر مرحلے میں",
  "action, response, rule, exception": "عمل، جواب، قاعدہ، استثنا",
  "How to review this prototype": "اس پروٹوٹائپ کو کیسے دیکھیں",
  "Open a flow to step through user action, SADA response, business rule and exception handling. The final button opens the corresponding interactive product screen.": "کسی فلو کو کھول کر صارف کا عمل، SADA کا جواب، کاروباری قاعدہ اور استثنائی حل مرحلہ وار دیکھیں۔ آخری بٹن متعلقہ انٹرایکٹو اسکرین کھولتا ہے۔",
  "User flow": "صارف فلو",
  "User": "صارف",
  "Commerce flow": "تجارتی فلو",
  "Commerce": "تجارت",
  "Partner flow": "پارٹنر فلو",
  "Partner": "پارٹنر",
  "Governance flow": "نظم و ضبط فلو",
  "Governance": "نظم و ضبط",
  "flow": "فلو",
  "steps": "مراحل",
  "Current product moment": "موجودہ پروڈکٹ مرحلہ",
  "User action": "صارف کا عمل",
  "SADA response": "SADA کا جواب",
  "Business and safety rule": "کاروباری اور حفاظتی قاعدہ",
  "Exception branch": "استثنائی راستہ",
  "Previous": "پچھلا",
  "Next step": "اگلا مرحلہ",
  "Complete flow": "فلو مکمل کریں",
  "View all exception branches": "تمام استثنائی راستے دیکھیں",
  "Exception and recovery paths": "استثنا اور بحالی کے راستے",
  "End-to-end path reviewed": "مکمل راستہ جانچ لیا گیا",
  "Review again": "دوبارہ دیکھیں",
  "Open interactive screen": "انٹرایکٹو اسکرین کھولیں",
  "New user activation": "نئے صارف کی فعالیت",
  "Friendship and private chat": "دوستی اور نجی چیٹ",
  "Voice room listener": "وائس روم سامع",
  "Voice room host": "وائس روم میزبان",
  "Social game session": "سماجی گیم سیشن",
  "Drama discovery and unlock": "ڈرامہ تلاش اور ان لاک",
  "Recharge and payment recovery": "ری چارج اور ادائیگی بحالی",
  "Store purchase and VIP": "اسٹور خریداری اور VIP",
  "Marketplace trade": "مارکیٹ تجارت",
  "Game developer publishing": "گیم ڈویلپر اشاعت",
  "Drama studio publishing": "ڈرامہ اسٹوڈیو اشاعت",
  "Report, block and appeal": "رپورٹ، بلاک اور اپیل",
  "Customer support case": "کسٹمر سپورٹ کیس",
  "From phone verification to first social relationship": "فون کی تصدیق سے پہلے سماجی تعلق تک",
  "Discover, request, accept, chat and play together": "تلاش، درخواست، قبول، چیٹ اور ساتھ کھیلنا",
  "Enter, interact, speak, gift and leave safely": "داخل ہوں، بات کریں، تحفہ دیں اور محفوظ نکلیں",
  "Create, moderate and close a live room": "لائیو روم بنائیں، سنبھالیں اور بند کریں",
  "Match, play, settle rewards and rematch": "میچ، کھیل، انعام کی ادائیگی اور دوبارہ میچ",
  "Watch, unlock, follow and discuss a series": "دیکھیں، ان لاک کریں، فالو اور گفتگو کریں",
  "Select pack, pay, receive assets and resolve exceptions": "پیک منتخب کریں، ادائیگی، اثاثے وصول اور مسائل حل کریں",
  "Preview, recharge if needed, purchase and equip": "پیش نظارہ، ضرورت پر ری چارج، خرید اور استعمال",
  "List, buy, risk-check and settle a collectible": "لسٹ، خرید، خطرہ جانچ اور کلیکٹیبل سیٹلمنٹ",
  "Apply, integrate, review, launch and settle": "درخواست، انضمام، جائزہ، لانچ اور سیٹلمنٹ",
  "Upload rights, episodes, subtitles and release schedule": "حقوق، اقساط، سب ٹائٹل اور ریلیز شیڈول اپ لوڈ",
  "Protect the user while preserving due process": "درست طریقہ برقرار رکھتے ہوئے صارف کا تحفظ",
  "Self-service, ticket, resolution and feedback": "خود مدد، ٹکٹ، حل اور فیڈبیک",
});

Object.assign(zh, {
  "Latest prototype systems":"最新原型系统","MockingBot · complete secondary and tertiary paths":"墨刀 · 完整二级与三级操作路径","prototype pages mapped":"个原型页面已映射","new operational flows":"条新增操作流程","flows self-checked":"条流程已自测","Activity":"活动","Safety":"安全","Latest MockingBot prototype":"最新墨刀原型","Open 33-page system operation map":"打开 33 页系统操作图","16 new secondary and tertiary flows are interactive":"16 条新增二三级流程可交互",
  "Seven-day check-in":"七日签到","Online rewards":"在线奖励","Task center":"任务中心","Wallet & ledger":"钱包与账单","Store item detail":"商城商品详情","Create listing":"创建上架","Marketplace orders":"市场订单","VIP benefit matrix":"VIP 权益矩阵","Report & appeal":"举报与申诉","Partner onboarding":"合作方入驻","Game partner console":"游戏合作方后台","Drama partner console":"短剧合作方后台","Review center":"审核中心","Partner analytics":"合作方数据分析","Settlement center":"结算中心","Tips & dialogs":"提示与对话框",
  "Expected outcome":"预期结果","Current operation":"当前操作","Next operation":"下一步操作","System response":"系统反馈","Continue":"继续","Confirm operation":"确认操作","Final confirmation":"最终确认","Operation complete":"操作完成","Back to systems":"返回系统列表","Run again":"再次运行","Required before final submission":"最终提交前必填","Ready for validation":"可以校验","VIP levels":"VIP 等级"
});

Object.assign(ur, {
  "Latest prototype systems":"تازہ ترین پروٹوٹائپ سسٹمز","MockingBot · complete secondary and tertiary paths":"MockingBot · مکمل ثانوی اور تیسرے درجے کے راستے","prototype pages mapped":"پروٹوٹائپ صفحات منسلک","new operational flows":"نئے عملی فلو","flows self-checked":"فلو خود جانچے گئے","Activity":"سرگرمی","Safety":"حفاظت","Latest MockingBot prototype":"تازہ ترین MockingBot پروٹوٹائپ","Open 33-page system operation map":"33 صفحات کا سسٹم نقشہ کھولیں","16 new secondary and tertiary flows are interactive":"16 نئے ثانوی اور تیسرے درجے کے فلو انٹرایکٹو ہیں",
  "Seven-day check-in":"سات روزہ چیک اِن","Online rewards":"آن لائن انعامات","Task center":"ٹاسک سینٹر","Wallet & ledger":"والیٹ اور لیجر","Store item detail":"اسٹور آئٹم تفصیل","Create listing":"لسٹنگ بنائیں","Marketplace orders":"مارکیٹ آرڈرز","VIP benefit matrix":"VIP فوائد میٹرکس","Report & appeal":"رپورٹ اور اپیل","Partner onboarding":"پارٹنر آن بورڈنگ","Game partner console":"گیم پارٹنر کنسول","Drama partner console":"ڈرامہ پارٹنر کنسول","Review center":"ریویو سینٹر","Partner analytics":"پارٹنر تجزیات","Settlement center":"سیٹلمنٹ سینٹر","Tips & dialogs":"اطلاعات اور ڈائیلاگ",
  "Expected outcome":"متوقع نتیجہ","Current operation":"موجودہ عمل","Next operation":"اگلا عمل","System response":"سسٹم جواب","Continue":"جاری رکھیں","Confirm operation":"عمل کی تصدیق","Final confirmation":"آخری تصدیق","Operation complete":"عمل مکمل","Back to systems":"سسٹمز پر واپس","Run again":"دوبارہ چلائیں","Required before final submission":"آخری جمع سے پہلے ضروری","Ready for validation":"جانچ کے لیے تیار","VIP levels":"VIP درجات"
});

Object.assign(zh, {
  "Settings":"设置","Appearance and profile":"外观与个人资料","Appearance":"外观","Color theme":"颜色主题","Choose how SADA looks on this device.":"选择 SADA 在此设备上的显示风格。","Emerald":"祖母绿","Deep green · dark gold":"深祖母绿 · 暗金","Default · Active":"默认 · 使用中","Default":"默认","Bright":"亮色","Ivory · vivid gradient":"象牙白 · 活力渐变","Active":"使用中","Choose":"选择","Profile":"个人资料","Emerald theme applied":"已切换为祖母绿主题","Bright theme applied":"已切换为亮色主题"
});

Object.assign(ur, {
  "Settings":"ترتیبات","Appearance and profile":"ظاہری شکل اور پروفائل","Appearance":"ظاہری شکل","Color theme":"رنگ تھیم","Choose how SADA looks on this device.":"اس ڈیوائس پر SADA کی ظاہری شکل منتخب کریں۔","Emerald":"زمردی","Deep green · dark gold":"گہرا سبز · سنہری","Default · Active":"ڈیفالٹ · فعال","Default":"ڈیفالٹ","Bright":"روشن","Ivory · vivid gradient":"سفید · شوخ گریڈینٹ","Active":"فعال","Choose":"منتخب کریں","Profile":"پروفائل","Emerald theme applied":"زمردی تھیم لاگو ہوگیا","Bright theme applied":"روشن تھیم لاگو ہوگیا"
});

const originals = new WeakMap<Node, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();
const attributes = ["aria-label", "placeholder", "title"];

function translate(value: string, locale: AppLocale) {
  if (locale === "en" || !value.trim()) return value;
  const dictionary = locale === "zh" ? zh : ur;
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  let result = value.trim();
  const entries = Object.entries(dictionary).sort((a, b) => b[0].length - a[0].length);
  for (const [source, target] of entries) result = result.split(source).join(target);
  return `${leading}${result}${trailing}`;
}

function localize(root: Element, locale: AppLocale) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (node.parentElement?.closest(".app-header,.language-menu,.app-scroll,.bottom-nav")) {
      node = walker.nextNode();
      continue;
    }
    const original = originals.get(node) ?? node.nodeValue ?? "";
    originals.set(node, original);
    const next = translate(original, locale);
    if (node.nodeValue !== next) node.nodeValue = next;
    node = walker.nextNode();
  }
  root.querySelectorAll("*").forEach((element) => {
    if (element.closest(".app-header,.language-menu,.app-scroll,.bottom-nav")) return;
    const saved = originalAttributes.get(element) ?? new Map<string, string>();
    attributes.forEach((name) => {
      const current = element.getAttribute(name);
      if (current !== null && !saved.has(name)) saved.set(name, current);
      const original = saved.get(name);
      if (original !== undefined) element.setAttribute(name, translate(original, locale));
    });
    originalAttributes.set(element, saved);
  });
}

export function useAppLocalization(locale: AppLocale) {
  useEffect(() => {
    const root = document.querySelector(".app-frame");
    if (!root) return;
    localize(root, locale);
    const observer = new MutationObserver((mutations) => {
      observer.disconnect();
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const original = node.nodeValue ?? "";
            originals.set(node, original);
            node.nodeValue = translate(original, locale);
          } else if (node instanceof Element) localize(node, locale);
        });
        if (mutation.type === "characterData") {
          const node = mutation.target;
          const original = node.nodeValue ?? "";
          originals.set(node, original);
          node.nodeValue = translate(original, locale);
        }
      }
      observer.observe(root, { childList: true, characterData: true, subtree: true });
    });
    observer.observe(root, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [locale]);
}
