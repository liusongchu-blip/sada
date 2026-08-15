const templates = Array.from(document.querySelectorAll('template[data-name]'));
const pages = templates.map(function(template) {
  return { id: template.id.replace('tpl-', ''), name: template.dataset.name };
});

const translations = {
  zh: {
    'Complete Prototype':'完整原型','All screens':'全部画板','Focus view':'单页查看','English detected':'检测到英语','Translate':'翻译','Restore':'恢复原文','Prototype pages':'原型页面','All prototype screens':'全部原型画板','Select any screen to inspect and interact.':'选择任意页面放大并操作。','OPEN':'打开',
    'Login & Splash':'登录与启动页','New Member Journey':'新用户旅程','Home':'首页','Voice Rooms':'语聊房','Room Detail':'房间详情','Game Lobby':'游戏大厅','Ludo Match':'Ludo 对局','Drama Feed':'短剧内容流','Drama Detail':'短剧详情','Friends':'好友','Store':'商城','Marketplace':'交易所','VIP 1–10':'VIP 1–10','Profile':'个人中心','Activity Center':'活动中心','Seven-day Check-in':'七日签到','Online Rewards':'在线奖励','Task Center':'任务中心','Recharge Diamonds':'钻石充值','Wallet & Ledger':'钱包与流水','Store Item Detail':'商城商品详情','Create Listing':'发布交易','Marketplace Orders':'交易订单','VIP Benefit Matrix':'VIP 权益矩阵','Safety Center':'安全中心','Report & Appeal':'举报与申诉','Partner Onboarding':'合作方入驻','Game Partner Console':'游戏合作方后台','Drama Partner Console':'短剧合作方后台','Review Center':'审核中心','Partner Analytics':'合作方数据分析','Settlement Center':'结算中心','Tips & Dialogs':'提示与弹窗',
    'Social entertainment, made for you.':'为你而生的社交娱乐。','Phone or email':'手机号或邮箱','Continue':'继续','or':'或','By continuing, you confirm you are 18+ and agree to our Terms & Community Rules.':'继续即表示你已满18岁，并同意用户条款与社区规则。','Welcome to SADA':'欢迎来到 SADA','Start with your crew.':'从认识新朋友开始。','Skip':'跳过','New member pack · 0 / 3':'新人礼包 · 0 / 3','Finish three simple moments and claim 80 Diamonds.':'完成三个简单任务，领取80钻石。','Enter a voice room':'进入语聊房','Find people talking right now.':'加入正在聊天的人。','Add one friend':'添加一位好友','Say salaam to someone new.':'向新朋友问好。','Play one mini game':'玩一局小游戏','A quick game counts.':'快速对局也会计入。','Gift preview: 80 Diamonds + Starter frame':'奖励预览：80钻石 + 新人头像框',
    'Good evening, Ayaan':'晚上好，Ayaan','Your people are live.':'你的朋友正在互动。','Karachi Night Chai':'卡拉奇夜茶会','Music, stories & open mic':'音乐、故事与开放麦','Play together':'一起玩','Games':'游戏','Ludo with friends':'和好友玩 Ludo','6 friends online':'6位好友在线',"Tonight's drama":'今晚短剧','Dil Se Door':'远离我心','Episode 04':'第04集','Online gift is ready in 18 min':'在线礼包18分钟后可领取',
    'Discover live conversations':'发现正在进行的语聊','Trending':'热门','Music':'音乐','New':'最新','Lahore Music House':'拉合尔音乐屋','Islamabad Game Night':'伊斯兰堡游戏夜','Poetry After Dark':'深夜诗会','Follow':'关注','Mic seats':'麦位','Audience chat':'听众聊天','Send gift':'赠送礼物','Start game':'发起游戏','Great song!':'唱得真好！','Who is joining Ludo?':'谁来一起玩 Ludo？',
    'Play with your people.':'和朋友一起玩。','Daily game task':'每日游戏任务','1 / 3 valid matches':'1 / 3 有效对局','Win Game Coin':'赢取游戏币','Carrom':'卡罗姆','Cricket Quiz':'板球问答','Live trivia':'实时答题','Online now':'当前在线','Invite':'邀请','Match in progress':'对局进行中','Your turn':'轮到你','Roll dice':'掷骰子','Valid match reward':'有效对局奖励','Game Coin pending settlement':'游戏币待结算','End match':'结束对局',
    'Now playing':'正在播放','Urdu / English subtitles':'乌尔都语 / 英语字幕','A love story where every message arrives too late.':'一段每条消息都来得太迟的爱情故事。','Episodes':'剧集','The goodbye':'告别','A missed call':'未接来电','The letter':'那封信','Coming home':'回家','Free':'免费','Unlock':'解锁','Discussion room':'讨论房','Unlock season':'解锁整季',
    'Recent chats':'最近聊天','Team invite':'组队邀请','Send a small gift':'赠送小礼物','Close friends':'亲密好友','Invite to play':'邀请游戏','Gifts':'礼物','Frames':'头像框','Bubbles':'聊天气泡','Rides':'座驾','Emerald Frame':'翡翠头像框','Permanent · Tradable':'永久 · 可交易','Moon Bubble':'月光气泡','7 days · Bound':'7天 · 绑定','Chai Ride':'奶茶座驾','Permanent · Bound':'永久 · 绑定',
    'New account rule: trading unlocks after 7 days and 3 valid matches.':'新账号注册满7天且完成3局有效对局后开放交易。','Tradable items':'可交易物品','Neon Cricket Fragment':'霓虹板球碎片','Ludo Royal Outfit':'Ludo 皇家装扮','Tradable · Fee 5%':'可交易 · 手续费5%','List an item':'上架物品',
    'VIP Center':'VIP 中心','Benefits':'权益','Your VIP benefits':'你的 VIP 权益','Identity display':'身份展示','VIP badge, golden name and entrance tag.':'VIP徽章、金色昵称和进场标识。','Social efficiency':'社交效率','More room follow slots and friend notes.':'更多房间关注名额和好友备注。','Trading convenience':'交易便利','Lower marketplace fee at higher tiers.':'更高等级享受更低交易手续费。','Priority care':'专属服务','Priority support from VIP 5.':'VIP 5起享受优先客服。','VIP never increases game win rate or bypasses risk control.':'VIP不会提高游戏胜率，也不能绕过风控。',
    'Diamonds':'钻石','Game Coin':'游戏币','Pending':'待结算','Daily tasks':'每日任务','Check-in':'签到','Completed':'已完成','Online reward':'在线奖励','Wallet':'钱包','Trading':'交易','Settings':'设置','Cancel':'取消','Confirm':'确认','Confirm purchase':'确认购买','Account restriction':'账号限制','Gift confirmation':'礼物确认','Match result':'对局结果','Reward claimed':'奖励已领取','Pending settlement':'待结算','Balance frozen':'余额已冻结','Content under review':'内容审核中','Submission failed':'提交失败','Statement ready':'结算单已生成'
  },
  ur: {
    'Complete Prototype':'مکمل پروٹوٹائپ','All screens':'تمام اسکرینز','Focus view':'تفصیلی منظر','English detected':'انگریزی کی شناخت ہوئی','Translate':'ترجمہ کریں','Restore':'اصل متن','Prototype pages':'پروٹوٹائپ صفحات','All prototype screens':'تمام پروٹوٹائپ اسکرینز','Select any screen to inspect and interact.':'کسی بھی اسکرین کو دیکھنے اور استعمال کرنے کے لیے منتخب کریں۔','OPEN':'کھولیں',
    'Login & Splash':'لاگ اِن','New Member Journey':'نیا رکن','Home':'ہوم','Voice Rooms':'وائس رومز','Room Detail':'روم کی تفصیل','Game Lobby':'گیم لابی','Ludo Match':'لڈو میچ','Drama Feed':'ڈرامہ فیڈ','Drama Detail':'ڈرامہ کی تفصیل','Friends':'دوست','Store':'اسٹور','Marketplace':'مارکیٹ پلیس','VIP 1–10':'وی آئی پی 1–10','Profile':'پروفائل','Activity Center':'سرگرمی مرکز','Seven-day Check-in':'سات روزہ چیک اِن','Online Rewards':'آن لائن انعامات','Task Center':'ٹاسک سینٹر','Recharge Diamonds':'ڈائمنڈ ریچارج','Wallet & Ledger':'والیٹ اور ریکارڈ','Store Item Detail':'اسٹور آئٹم کی تفصیل','Create Listing':'لسٹنگ بنائیں','Marketplace Orders':'مارکیٹ آرڈرز','VIP Benefit Matrix':'VIP فوائد میٹرکس','Safety Center':'حفاظتی مرکز','Report & Appeal':'رپورٹ اور اپیل','Partner Onboarding':'پارٹنر آن بورڈنگ','Game Partner Console':'گیم پارٹنر کنسول','Drama Partner Console':'ڈرامہ پارٹنر کنسول','Review Center':'ریویو سینٹر','Partner Analytics':'پارٹنر تجزیات','Settlement Center':'سیٹلمنٹ سینٹر','Tips & Dialogs':'پیغامات اور ڈائیلاگ',
    'Social entertainment, made for you.':'سوشل انٹرٹینمنٹ، آپ کے لیے۔','Phone or email':'فون یا ای میل','Continue':'جاری رکھیں','or':'یا','By continuing, you confirm you are 18+ and agree to our Terms & Community Rules.':'جاری رکھ کر آپ تصدیق کرتے ہیں کہ آپ 18 سال سے زائد ہیں اور قواعد سے اتفاق کرتے ہیں۔','Welcome to SADA':'SADA میں خوش آمدید','Start with your crew.':'اپنے دوستوں کے ساتھ شروع کریں۔','Skip':'چھوڑیں','New member pack · 0 / 3':'نئے رکن کا پیک · 0 / 3','Finish three simple moments and claim 80 Diamonds.':'تین آسان کام مکمل کریں اور 80 ڈائمنڈ حاصل کریں۔','Enter a voice room':'وائس روم میں جائیں','Find people talking right now.':'ابھی بات کرنے والے لوگوں کو تلاش کریں۔','Add one friend':'ایک دوست شامل کریں','Say salaam to someone new.':'کسی نئے شخص کو سلام کہیں۔','Play one mini game':'ایک منی گیم کھیلیں','A quick game counts.':'ایک مختصر گیم بھی شمار ہوگی۔','Gift preview: 80 Diamonds + Starter frame':'انعام: 80 ڈائمنڈ + اسٹارٹر فریم',
    'Good evening, Ayaan':'شام بخیر، ایان','Your people are live.':'آپ کے دوست لائیو ہیں۔','Karachi Night Chai':'کراچی نائٹ چائے','Music, stories & open mic':'موسیقی، کہانیاں اور اوپن مائک','Play together':'ساتھ کھیلیں','Games':'گیمز','Ludo with friends':'دوستوں کے ساتھ لڈو','6 friends online':'6 دوست آن لائن',"Tonight's drama":'آج رات کا ڈرامہ','Dil Se Door':'دل سے دور','Episode 04':'قسط 04','Online gift is ready in 18 min':'آن لائن تحفہ 18 منٹ میں تیار ہوگا',
    'Discover live conversations':'لائیو گفتگو دریافت کریں','Trending':'مقبول','Music':'موسیقی','New':'نیا','Lahore Music House':'لاہور میوزک ہاؤس','Islamabad Game Night':'اسلام آباد گیم نائٹ','Poetry After Dark':'رات کی شاعری','Follow':'فالو','Mic seats':'مائک سیٹس','Audience chat':'سامعین کی چیٹ','Send gift':'تحفہ بھیجیں','Start game':'گیم شروع کریں','Great song!':'بہت اچھا گانا!','Who is joining Ludo?':'لڈو کون کھیلے گا؟',
    'Play with your people.':'اپنے دوستوں کے ساتھ کھیلیں۔','Daily game task':'روزانہ گیم ٹاسک','1 / 3 valid matches':'1 / 3 درست میچ','Win Game Coin':'گیم کوائن جیتیں','Carrom':'کیرم','Cricket Quiz':'کرکٹ کوئز','Live trivia':'لائیو سوالات','Online now':'ابھی آن لائن','Invite':'دعوت دیں','Match in progress':'میچ جاری ہے','Your turn':'آپ کی باری','Roll dice':'پانسہ پھینکیں','Valid match reward':'درست میچ کا انعام','Game Coin pending settlement':'گیم کوائن زیر تصفیہ','End match':'میچ ختم کریں',
    'Now playing':'اب چل رہا ہے','Urdu / English subtitles':'اردو / انگریزی سب ٹائٹلز','A love story where every message arrives too late.':'ایک محبت کی کہانی جہاں ہر پیغام دیر سے پہنچتا ہے۔','Episodes':'اقساط','The goodbye':'الوداع','A missed call':'مسڈ کال','The letter':'خط','Coming home':'گھر واپسی','Free':'مفت','Unlock':'ان لاک','Discussion room':'ڈسکشن روم','Unlock season':'سیزن ان لاک کریں',
    'Recent chats':'حالیہ چیٹس','Team invite':'ٹیم دعوت','Send a small gift':'چھوٹا تحفہ بھیجیں','Close friends':'قریبی دوست','Invite to play':'کھیلنے کی دعوت','Gifts':'تحائف','Frames':'فریمز','Bubbles':'چیٹ ببلز','Rides':'رائیڈز','Emerald Frame':'ایمرلڈ فریم','Permanent · Tradable':'مستقل · قابل تجارت','Moon Bubble':'مون ببل','7 days · Bound':'7 دن · باؤنڈ','Chai Ride':'چائے رائیڈ','Permanent · Bound':'مستقل · باؤنڈ',
    'New account rule: trading unlocks after 7 days and 3 valid matches.':'نئے اکاؤنٹ میں 7 دن اور 3 درست میچ کے بعد تجارت کھلتی ہے۔','Tradable items':'قابل تجارت اشیاء','Neon Cricket Fragment':'نیون کرکٹ فریگمنٹ','Ludo Royal Outfit':'لڈو رائل آؤٹ فٹ','Tradable · Fee 5%':'قابل تجارت · فیس 5%','List an item':'آئٹم لسٹ کریں',
    'VIP Center':'وی آئی پی سینٹر','Benefits':'فوائد','Your VIP benefits':'آپ کے VIP فوائد','Identity display':'شناخت کی نمائش','VIP badge, golden name and entrance tag.':'VIP بیج، سنہری نام اور انٹری ٹیگ۔','Social efficiency':'سوشل سہولت','More room follow slots and friend notes.':'مزید روم فالو سلاٹس اور دوست نوٹس۔','Trading convenience':'تجارتی سہولت','Lower marketplace fee at higher tiers.':'اعلیٰ درجوں پر کم مارکیٹ فیس۔','Priority care':'خصوصی خدمت','Priority support from VIP 5.':'VIP 5 سے ترجیحی مدد۔','VIP never increases game win rate or bypasses risk control.':'VIP گیم جیتنے کی شرح نہیں بڑھاتا اور رسک کنٹرول کو نظرانداز نہیں کرتا۔',
    'Diamonds':'ڈائمنڈز','Game Coin':'گیم کوائن','Pending':'زیر التوا','Daily tasks':'روزانہ کام','Check-in':'چیک اِن','Completed':'مکمل','Online reward':'آن لائن انعام','Wallet':'والیٹ','Trading':'تجارت','Settings':'سیٹنگز','Cancel':'منسوخ','Confirm':'تصدیق','Confirm purchase':'خریداری کی تصدیق','Account restriction':'اکاؤنٹ کی پابندی','Gift confirmation':'تحفے کی تصدیق','Match result':'میچ کا نتیجہ','Reward claimed':'انعام مل گیا','Pending settlement':'تصفیہ زیر التوا','Balance frozen':'بیلنس منجمد','Content under review':'مواد زیر جائزہ','Submission failed':'جمع کرانا ناکام','Statement ready':'اسٹیٹمنٹ تیار ہے'
  }
};

let currentPage = 'home';
let currentMode = 'overview';
let currentLanguage = 'en';
let vipLevel = 3;

function getTemplate(id) {
  return document.getElementById('tpl-' + id);
}

function addBottomNavigation(root) {
  root.querySelectorAll('.bottom-nav').forEach(function(nav) {
    var active = nav.dataset.active;
    [['home','H','Home'],['rooms','R','Voice Rooms'],['games','P','Game Lobby'],['drama','D','Drama Feed'],['profile','U','Profile']].forEach(function(item) {
      var button = document.createElement('button');
      button.dataset.nav = item[0];
      if (item[0] === active) button.className = 'active';
      button.innerHTML = '<b>' + item[1] + '</b>' + item[2];
      nav.appendChild(button);
    });
  });
}

function seedSpecialContent(root) {
  root.querySelectorAll('#boardSeed').forEach(function(board) {
    for (var i = 0; i < 25; i += 1) {
      var cell = document.createElement('span');
      cell.className = 'game-cell';
      board.appendChild(cell);
    }
  });
  root.querySelectorAll('#tierStrip').forEach(function(strip) {
    for (var level = 1; level <= 10; level += 1) {
      var button = document.createElement('button');
      button.className = 'tier-button' + (level === vipLevel ? ' active' : '');
      button.dataset.vip = String(level);
      button.textContent = 'V' + level;
      strip.appendChild(button);
    }
  });
}

function cloneScreen(id) {
  var fragment = getTemplate(id).content.cloneNode(true);
  var holder = document.createElement('div');
  holder.appendChild(fragment);
  addBottomNavigation(holder);
  seedSpecialContent(holder);
  return holder;
}

function bindActions(root) {
  root.querySelectorAll('[data-nav]').forEach(function(button) {
    button.addEventListener('click', function(event) {
      event.stopPropagation();
      openPage(button.dataset.nav);
    });
  });
  root.querySelectorAll('[data-tip]').forEach(function(button) {
    button.addEventListener('click', function(event) {
      event.stopPropagation();
      openTip(button.dataset.tipKind || 'info', button.dataset.tipTitle || 'Confirm', button.dataset.tipBody || '');
    });
  });
  root.querySelectorAll('[data-action]').forEach(function(button) {
    button.addEventListener('click', function(event) {
      event.stopPropagation();
      var action = button.dataset.action;
      if (action === 'buy' || action === 'quote') openModal('Confirm purchase', '60 Diamonds · Item purchase preview');
      if (action === 'list') openModal('Account restriction', 'Trading unlocks after 7 days and 3 valid matches.');
      if (action === 'gift') openModal('Gift confirmation', 'Moon Letter · 80 Diamonds');
      if (action === 'roll') openModal('Roll dice', '4 · +24 Game Coin');
      if (action === 'result') openModal('Match result', '+24 Game Coin pending settlement');
    });
  });
  root.querySelectorAll('[data-vip]').forEach(function(button) {
    button.addEventListener('click', function(event) {
      event.stopPropagation();
      vipLevel = Number(button.dataset.vip);
      renderFocus();
    });
  });
}

function renderPageList() {
  var list = document.getElementById('pageList');
  list.innerHTML = '';
  pages.forEach(function(page, index) {
    var button = document.createElement('button');
    button.className = 'page-link' + (page.id === currentPage ? ' active' : '');
    button.innerHTML = '<span class="page-index">' + String(index + 1).padStart(2, '0') + '</span><span>' + page.name + '</span>';
    button.addEventListener('click', function() { openPage(page.id); });
    list.appendChild(button);
  });
}

function renderOverview() {
  var overview = document.getElementById('overview');
  overview.innerHTML = '';
  pages.forEach(function(page, index) {
    var card = document.createElement('button');
    card.className = 'prototype-card';
    var label = document.createElement('span');
    label.className = 'card-label';
    label.innerHTML = '<span>' + String(index + 1).padStart(2, '0') + ' · ' + page.name + '</span><em>OPEN</em>';
    var viewport = document.createElement('span');
    viewport.className = 'mini-viewport';
    var phone = document.createElement('span');
    phone.className = 'mini-phone';
    phone.appendChild(cloneScreen(page.id));
    viewport.appendChild(phone);
    card.appendChild(label);
    card.appendChild(viewport);
    card.addEventListener('click', function() { openPage(page.id); });
    overview.appendChild(card);
  });
}

function renderFocus() {
  var phone = document.getElementById('focusPhone');
  phone.innerHTML = '';
  var content = cloneScreen(currentPage);
  phone.appendChild(content);
  bindActions(phone);
  applyTranslations(phone, currentLanguage);
}

function setMode(mode) {
  currentMode = mode;
  var overviewMode = mode === 'overview';
  document.getElementById('overview').classList.toggle('hidden', !overviewMode);
  document.getElementById('focus').classList.toggle('active', !overviewMode);
  document.getElementById('overviewButton').classList.toggle('active', overviewMode);
  document.getElementById('focusButton').classList.toggle('active', !overviewMode);
  document.getElementById('canvasTitle').textContent = overviewMode ? 'All prototype screens' : pages.find(function(page) { return page.id === currentPage; }).name;
  document.getElementById('fileLabel').textContent = overviewMode ? pages.length + ' screens' : currentPage + '.html';
  if (!overviewMode) renderFocus();
  applyTranslations(document.getElementById('appShell'), currentLanguage);
}

function openPage(id) {
  currentPage = id;
  renderPageList();
  setMode('focus');
  document.querySelector('.canvas').scrollTop = 0;
}

function applyTranslations(root, language) {
  if (!root) return;
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  var nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(function(node) {
    if (node.__sourceText === undefined) node.__sourceText = node.nodeValue;
    var source = node.__sourceText;
    var trimmed = source.trim();
    if (!trimmed) return;
    var translated = language === 'en' ? trimmed : ((translations[language] && translations[language][trimmed]) || trimmed);
    node.nodeValue = source.replace(trimmed, translated);
  });
}

function changeLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language;
  document.body.dir = language === 'ur' ? 'rtl' : 'ltr';
  renderPageList();
  renderOverview();
  renderFocus();
  setMode(currentMode);
  applyTranslations(document.getElementById('appShell'), language);
  document.getElementById('translateStatus').textContent = language === 'en' ? 'English detected' : (language === 'ur' ? 'English → اردو' : 'English → 中文');
}

function openModal(title, body) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').textContent = body;
  document.getElementById('modal').classList.add('open');
  applyTranslations(document.getElementById('modal'), currentLanguage);
}

function openTip(kind, title, body) {
  var card = document.querySelector('#modal .modal-card');
  var symbols = { success: '✓', warning: '!', danger: '×', info: 'i' };
  card.classList.remove('tip-success', 'tip-warning', 'tip-danger', 'tip-info');
  card.classList.add('tip-' + kind);
  document.getElementById('modalSymbol').textContent = symbols[kind] || symbols.info;
  openModal(title, body);
}

document.getElementById('overviewButton').addEventListener('click', function() { setMode('overview'); });
document.getElementById('focusButton').addEventListener('click', function() { setMode('focus'); });
document.getElementById('translateButton').addEventListener('click', function() { changeLanguage(document.getElementById('languageSelect').value); });
document.getElementById('restoreButton').addEventListener('click', function() { document.getElementById('languageSelect').value = 'en'; changeLanguage('en'); });
document.getElementById('modalCancel').addEventListener('click', function() { document.getElementById('modal').classList.remove('open'); });
document.getElementById('modalConfirm').addEventListener('click', function() { document.getElementById('modal').classList.remove('open'); });
document.getElementById('modal').addEventListener('click', function(event) { if (event.target.id === 'modal') event.currentTarget.classList.remove('open'); });

document.getElementById('pageCount').textContent = pages.length;
renderPageList();
renderOverview();
renderFocus();
setMode('overview');
