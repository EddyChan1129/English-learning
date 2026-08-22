export type EssentialPhrasalVerb = {
  id: number;
  phrase: string;
  definition: string;
  chinese: string;
  synonyms: string[];
  example: string;
};

// Extracted from the supplied HZad Education PDF, then cleaned and organised for study.
export const ESSENTIAL_PHRASAL_VERBS: EssentialPhrasalVerb[] = [
  {
    "id": 1,
    "phrase": "Aim At",
    "definition": "To point at a specific target.",
    "example": "It is important to never aim at a person when at the gun range.",
    "chinese": "針對、瞄準",
    "synonyms": [
      "target",
      "focus on"
    ]
  },
  {
    "id": 2,
    "phrase": "Back Down",
    "definition": "To surrender your claim or position.",
    "example": "Don’t back down when he challenges you.",
    "chinese": "退讓",
    "synonyms": [
      "yield",
      "give in"
    ]
  },
  {
    "id": 3,
    "phrase": "Beef Up",
    "definition": "To make better or bigger.",
    "example": "Let’s beef up this resume to help Carter get a job.",
    "chinese": "加強、擴充",
    "synonyms": [
      "strengthen",
      "improve"
    ]
  },
  {
    "id": 4,
    "phrase": "Blow Off",
    "definition": "When the wind moves something from its original place.",
    "example": "Make sure the napkins don’t blow off the table.",
    "chinese": "吹走、不理會",
    "synonyms": [
      "dismiss",
      "brush off"
    ]
  },
  {
    "id": 5,
    "phrase": "Blow Out",
    "definition": "To put out a flame.",
    "example": "I can’t wait to blow out my birthday candles and make a wish.",
    "chinese": "吹熄",
    "synonyms": [
      "extinguish",
      "put out"
    ]
  },
  {
    "id": 6,
    "phrase": "Boil Down To",
    "definition": "To determine a specific conclusion or reasoning.",
    "example": "I think what it boils down to is her unwillingness to compromise.",
    "chinese": "歸根究底",
    "synonyms": [
      "amount to",
      "come down to"
    ]
  },
  {
    "id": 7,
    "phrase": "Break Down",
    "definition": "When someone is mentally exhausted or frustrated.",
    "example": "All of these events happening at once has caused her to have a break down.",
    "chinese": "崩潰、故障",
    "synonyms": [
      "collapse",
      "stop working"
    ]
  },
  {
    "id": 8,
    "phrase": "Break Through",
    "definition": "To create a path through.",
    "example": "You’re going to have to break through this door to get inside the burning building.",
    "chinese": "衝破",
    "synonyms": [
      "penetrate",
      "overcome"
    ]
  },
  {
    "id": 9,
    "phrase": "Break Up",
    "definition": "To stop something from happening.",
    "example": "Officer Brown had to break up a fight at the high school.",
    "chinese": "分手、制止",
    "synonyms": [
      "separate",
      "split up"
    ]
  },
  {
    "id": 10,
    "phrase": "Bring Up",
    "definition": "To carry or take something low to a higher place.",
    "example": "Can you bring up that table from downstairsti",
    "chinese": "提起、帶上來",
    "synonyms": [
      "mention",
      "raise"
    ]
  },
  {
    "id": 11,
    "phrase": "Brush Off",
    "definition": "To get rid of with your hand.",
    "example": "Let’s brush off that dirt on your pants and get going.",
    "chinese": "拂去、不理",
    "synonyms": [
      "dismiss",
      "dust off"
    ]
  },
  {
    "id": 12,
    "phrase": "Brush Up",
    "definition": "To review a particular skill or piece of knowledge you haven’t used in awhile.",
    "example": "Brush up on your dinosaur facts before we go to the museum.",
    "chinese": "溫習",
    "synonyms": [
      "review",
      "refresh"
    ]
  },
  {
    "id": 13,
    "phrase": "Build In/Into",
    "definition": "To construct something in a certain place.",
    "example": "People often purchase homes with shelving that was built in.",
    "chinese": "加入設計、內置",
    "synonyms": [
      "incorporate",
      "integrate"
    ]
  },
  {
    "id": 14,
    "phrase": "Burn Down",
    "definition": "When fire is used to destroy something.",
    "example": "Why did they burn down the abandoned amusement parkti",
    "chinese": "燒毀",
    "synonyms": [
      "destroy by fire",
      "raze"
    ]
  },
  {
    "id": 15,
    "phrase": "Burn Up",
    "definition": "To be destroyed with fire.",
    "example": "Burn up this wood in the fireplace to keep warm.",
    "chinese": "燒光",
    "synonyms": [
      "consume by fire",
      "overheat"
    ]
  },
  {
    "id": 16,
    "phrase": "Burst Out",
    "definition": "To say something suddenly or out of the blue.",
    "example": "She burst out the answer before the class could figure it out.",
    "chinese": "突然爆發",
    "synonyms": [
      "exclaim",
      "erupt"
    ]
  },
  {
    "id": 17,
    "phrase": "Butt In",
    "definition": "To insert yourself into a conversation or event.",
    "example": "I hate to butt in on your conversation, but did you say something about dragonsti",
    "chinese": "插嘴",
    "synonyms": [
      "interrupt",
      "interject"
    ]
  },
  {
    "id": 18,
    "phrase": "Call Back",
    "definition": "To call again.",
    "example": "Let me call you back after lunch.",
    "chinese": "回電話",
    "synonyms": [
      "return a call",
      "phone back"
    ]
  },
  {
    "id": 19,
    "phrase": "Call In",
    "definition": "To request someone’s presence.",
    "example": "I really hope they don’t call me in to work on my day off.",
    "chinese": "召來、打電話請假",
    "synonyms": [
      "summon",
      "request"
    ]
  },
  {
    "id": 20,
    "phrase": "Care For",
    "definition": "To be responsible for someone’s wellbeing.",
    "example": "I will care for my sister’s dog while she’s away.",
    "chinese": "照顧、喜歡",
    "synonyms": [
      "look after",
      "like"
    ]
  },
  {
    "id": 21,
    "phrase": "Carry Away",
    "definition": "To act on emotions when doing something.",
    "example": "Don’t get too carried away decorating for Halloween.",
    "chinese": "過度興奮、失控",
    "synonyms": [
      "get excited",
      "overdo"
    ]
  },
  {
    "id": 22,
    "phrase": "Carry On",
    "definition": "To continue.",
    "example": "I could barely carry on after my husband’s passing.",
    "chinese": "繼續",
    "synonyms": [
      "continue",
      "proceed"
    ]
  },
  {
    "id": 23,
    "phrase": "Carry Out",
    "definition": "To move from one place to another.",
    "example": "Let me carry this bag of ice out of here for you.",
    "chinese": "執行、搬出去",
    "synonyms": [
      "execute",
      "perform"
    ]
  },
  {
    "id": 24,
    "phrase": "Catch On",
    "definition": "To eventually realize something.",
    "example": "Someday he’ll catch on when his brother tells inappropriate jokes, but he’s too young.",
    "chinese": "明白、流行起來",
    "synonyms": [
      "understand",
      "become popular"
    ]
  },
  {
    "id": 25,
    "phrase": "Catch Up",
    "definition": "To get closer to something that became far away.",
    "example": "We need to catch up to Larry’s car.",
    "chinese": "追上、補進度",
    "synonyms": [
      "reach",
      "get up to date"
    ]
  },
  {
    "id": 26,
    "phrase": "Chicken Out",
    "definition": "To get too scared to do something.",
    "example": "We went zip lining, but Grace chickened out before it was her turn.",
    "chinese": "臨陣退縮",
    "synonyms": [
      "back out",
      "lose nerve"
    ]
  },
  {
    "id": 27,
    "phrase": "Clear Up",
    "definition": "To solve a misunderstanding or issue.",
    "example": "Jo thought I was mad, so I had to clear things up with her.",
    "chinese": "澄清、放晴",
    "synonyms": [
      "resolve",
      "clarify"
    ]
  },
  {
    "id": 28,
    "phrase": "Clog Up",
    "definition": "To prevent something from coming through.",
    "example": "The accident clogged up the intersection.",
    "chinese": "堵塞",
    "synonyms": [
      "block",
      "obstruct"
    ]
  },
  {
    "id": 29,
    "phrase": "Close Off",
    "definition": "To block something.",
    "example": "The cones on the road closed off one lane.",
    "chinese": "封閉",
    "synonyms": [
      "block",
      "seal off"
    ]
  },
  {
    "id": 30,
    "phrase": "Come About",
    "definition": "To happen or occur.",
    "example": "How did this come aboutti",
    "chinese": "發生",
    "synonyms": [
      "happen",
      "occur"
    ]
  },
  {
    "id": 31,
    "phrase": "Come Across",
    "definition": "The way something is perceived; to move sides.",
    "example": "Come across the street to my house.",
    "chinese": "偶遇、給人印象",
    "synonyms": [
      "encounter",
      "seem"
    ]
  },
  {
    "id": 32,
    "phrase": "Come Apart",
    "definition": "To break into pieces.",
    "example": "The glue didn’t hold, so her scrapbook started to come apart.",
    "chinese": "散開、破裂",
    "synonyms": [
      "separate",
      "disintegrate"
    ]
  },
  {
    "id": 33,
    "phrase": "Come Down To",
    "definition": "To narrow down a situation.",
    "example": "It’s come down to three contestants lef.",
    "chinese": "歸根結底",
    "synonyms": [
      "boil down to",
      "depend on"
    ]
  },
  {
    "id": 34,
    "phrase": "Come Down With",
    "definition": "To become ill or experience symptoms of an illness.",
    "example": "Jay is starting to come down with a cold.",
    "chinese": "患上（疾病）",
    "synonyms": [
      "become ill",
      "catch"
    ]
  },
  {
    "id": 35,
    "phrase": "Come Off",
    "definition": "When something is removed; how something is perceived.",
    "example": "She can come off a little rude, but she means well.",
    "chinese": "脫落、顯得",
    "synonyms": [
      "detach",
      "appear"
    ]
  },
  {
    "id": 36,
    "phrase": "Come Through",
    "definition": "To arrive expectedly; to cause a result.",
    "example": "I knew you would come through on your way to the city.",
    "chinese": "成功做到、送達",
    "synonyms": [
      "succeed",
      "arrive"
    ]
  },
  {
    "id": 37,
    "phrase": "Come Up With",
    "definition": "To think of something.",
    "example": "We have to come up with a plan.",
    "chinese": "想出",
    "synonyms": [
      "devise",
      "think of"
    ]
  },
  {
    "id": 38,
    "phrase": "Con Into",
    "definition": "To deceptively convince someone to do something.",
    "example": "I got conned into driving everyone tonight.",
    "chinese": "騙某人做",
    "synonyms": [
      "trick into",
      "deceive"
    ]
  },
  {
    "id": 39,
    "phrase": "Con Out Of",
    "definition": "To convince someone to give you something by lying.",
    "example": "Heather conned me out of my last piece of gum.",
    "chinese": "騙走",
    "synonyms": [
      "swindle",
      "cheat out of"
    ]
  },
  {
    "id": 40,
    "phrase": "Cross Off",
    "definition": "To mark as complete.",
    "example": "I can cross washing my car off today’s to do list.",
    "chinese": "劃掉",
    "synonyms": [
      "tick off",
      "mark complete"
    ]
  },
  {
    "id": 41,
    "phrase": "Cut Back",
    "definition": "To reduce.",
    "example": "Dolly had to cut back on spending this month to save money for her trip.",
    "chinese": "削減",
    "synonyms": [
      "reduce",
      "scale back"
    ]
  },
  {
    "id": 42,
    "phrase": "Cut Down",
    "definition": "To lessen something.",
    "example": "I watched them cut down that giant tree in our neighborhood.",
    "chinese": "減少、砍倒",
    "synonyms": [
      "reduce",
      "fell"
    ]
  },
  {
    "id": 43,
    "phrase": "Do Away With",
    "definition": "To get rid of something.",
    "example": "How about we do away with her pacifier once she starts teething.",
    "chinese": "廢除、除掉",
    "synonyms": [
      "abolish",
      "eliminate"
    ]
  },
  {
    "id": 44,
    "phrase": "Do Over",
    "definition": "To do again in a better way.",
    "example": "Can I get a do over on that dateti",
    "chinese": "重做",
    "synonyms": [
      "redo",
      "repeat"
    ]
  },
  {
    "id": 45,
    "phrase": "Do Without",
    "definition": "To be fine without.",
    "example": "I could do without the yelling please.",
    "chinese": "沒有也行",
    "synonyms": [
      "manage without",
      "forgo"
    ]
  },
  {
    "id": 46,
    "phrase": "Doze Off",
    "definition": "To fall asleep on accident.",
    "example": "Todd dozed off on the couch while watching football.",
    "chinese": "打瞌睡",
    "synonyms": [
      "fall asleep",
      "nod off"
    ]
  },
  {
    "id": 47,
    "phrase": "Dress Up",
    "definition": "To look good or more formal.",
    "example": "Let’s dress up in costume for the party.",
    "chinese": "盛裝、打扮",
    "synonyms": [
      "wear formal clothes",
      "costume"
    ]
  },
  {
    "id": 48,
    "phrase": "Drop In",
    "definition": "To come by unexpectedly.",
    "example": "I hope you don’t mind that I dropped in while I was in the area.",
    "chinese": "順道探訪",
    "synonyms": [
      "visit casually",
      "pop in"
    ]
  },
  {
    "id": 49,
    "phrase": "Dry Out",
    "definition": "To take away all water or liquid.",
    "example": "We set the towels down to dry out.",
    "chinese": "乾透",
    "synonyms": [
      "dehydrate",
      "dry"
    ]
  },
  {
    "id": 50,
    "phrase": "Eat Up",
    "definition": "To consume all of.",
    "example": "Kenna told her to eat up her vegetables to get stronger.",
    "chinese": "吃光",
    "synonyms": [
      "finish",
      "consume"
    ]
  },
  {
    "id": 51,
    "phrase": "Empty Out",
    "definition": "To remove all items from.",
    "example": "Empty out your backpack at the end of the year.",
    "chinese": "清空",
    "synonyms": [
      "clear",
      "remove everything"
    ]
  },
  {
    "id": 52,
    "phrase": "End Up",
    "definition": "The way something finishes.",
    "example": "Harold may end up at my place tomorrow.",
    "chinese": "最終成為",
    "synonyms": [
      "finish",
      "wind up"
    ]
  },
  {
    "id": 53,
    "phrase": "Fall Behind",
    "definition": "To progress slower than the rest.",
    "example": "I started to fall behind in my classes.",
    "chinese": "落後",
    "synonyms": [
      "lag",
      "get behind"
    ]
  },
  {
    "id": 54,
    "phrase": "Fall Out",
    "definition": "To drop down.",
    "example": "Make sure nothing fell out of the cart on our walk to the car.",
    "chinese": "掉出、鬧翻",
    "synonyms": [
      "drop out",
      "quarrel"
    ]
  },
  {
    "id": 55,
    "phrase": "Fall Through",
    "definition": "To be cancelled; to fail.",
    "example": "I hate it when plans fall through.",
    "chinese": "告吹、失敗",
    "synonyms": [
      "fail",
      "collapse"
    ]
  },
  {
    "id": 56,
    "phrase": "Feel Up To",
    "definition": "To feel well enough to participate.",
    "example": "Abby doesn’t feel up to going out tonight after being sick this week.",
    "chinese": "有精神做",
    "synonyms": [
      "feel able",
      "be willing"
    ]
  },
  {
    "id": 57,
    "phrase": "Fill Out",
    "definition": "To complete or finish.",
    "example": "I will have you fill out this form before you go.",
    "chinese": "填寫",
    "synonyms": [
      "complete",
      "fill in"
    ]
  },
  {
    "id": 58,
    "phrase": "Flip Out",
    "definition": "To get uncontrollably angry.",
    "example": "After the week she’s had, I don’t blame her for flipping out when she came home to a mess.",
    "chinese": "勃然大怒",
    "synonyms": [
      "lose control",
      "freak out"
    ]
  },
  {
    "id": 59,
    "phrase": "Follow Up",
    "definition": "To do more investigating.",
    "example": "Please follow up with me after taking your medicine for two weeks.",
    "chinese": "跟進",
    "synonyms": [
      "check back",
      "pursue"
    ]
  },
  {
    "id": 60,
    "phrase": "Get Along",
    "definition": "To be able to do; to interact well with others.",
    "example": "He should get along fine.",
    "chinese": "相處融洽",
    "synonyms": [
      "coexist",
      "get on"
    ]
  },
  {
    "id": 61,
    "phrase": "Get Back",
    "definition": "To return somewhere.",
    "example": "Get back over here.",
    "chinese": "返回",
    "synonyms": [
      "return",
      "come back"
    ]
  },
  {
    "id": 62,
    "phrase": "Get Back To",
    "definition": "To return an answer or fulfill a request.",
    "example": "I will get back to you first thing tomorrow with that.",
    "chinese": "稍後回覆",
    "synonyms": [
      "reply later",
      "respond"
    ]
  },
  {
    "id": 63,
    "phrase": "Get Behind",
    "definition": "To support; to be slower than others.",
    "example": "Breakfast for dinner is something I can get behind.",
    "chinese": "支持、落後",
    "synonyms": [
      "support",
      "fall behind"
    ]
  },
  {
    "id": 64,
    "phrase": "Get By",
    "definition": "To survive; to pass.",
    "example": "Her dad barely makes enough for their family to get by.",
    "chinese": "勉強過活",
    "synonyms": [
      "manage",
      "survive"
    ]
  },
  {
    "id": 65,
    "phrase": "Get Over",
    "definition": "To stop being upset about; to clear an obstacle.",
    "example": "I wasn’t sure if he would get over that last hurdle.",
    "chinese": "克服、恢復",
    "synonyms": [
      "recover",
      "overcome"
    ]
  },
  {
    "id": 66,
    "phrase": "Get Through",
    "definition": "To understand; to finish; to endure.",
    "example": "You will get through this semester I promise.",
    "chinese": "完成、捱過",
    "synonyms": [
      "finish",
      "endure"
    ]
  },
  {
    "id": 67,
    "phrase": "Get Together",
    "definition": "To meet up for a specific reason; to gather.",
    "example": "Let’s get together this weekend for lunch.",
    "chinese": "聚會",
    "synonyms": [
      "meet",
      "gather"
    ]
  },
  {
    "id": 68,
    "phrase": "Give In",
    "definition": "To accept defeat.",
    "example": "His mom was disappointed that he gave in to peer pressure.",
    "chinese": "屈服",
    "synonyms": [
      "surrender",
      "yield"
    ]
  },
  {
    "id": 69,
    "phrase": "Give Out",
    "definition": "To produce or distribute.",
    "example": "They’re giving out coupons in the local newspaper.",
    "chinese": "派發、耗盡",
    "synonyms": [
      "distribute",
      "run out"
    ]
  },
  {
    "id": 70,
    "phrase": "Go About",
    "definition": "To act normally; to follow the correct process to get something done.",
    "example": "The news anchor advised us to go about our day as normal even with a criminal on the loose.",
    "chinese": "處理、著手",
    "synonyms": [
      "approach",
      "proceed"
    ]
  },
  {
    "id": 71,
    "phrase": "Go After",
    "definition": "To follow even if it’s difficult.",
    "example": "Reba had to go after her dog when it escaped from her backyard.",
    "chinese": "追求、追趕",
    "synonyms": [
      "pursue",
      "chase"
    ]
  },
  {
    "id": 72,
    "phrase": "Go Along With",
    "definition": "To agree with in order to avoid conflict.",
    "example": "Just go along with his plan so he doesn’t freak out.",
    "chinese": "同意、配合",
    "synonyms": [
      "agree",
      "comply"
    ]
  },
  {
    "id": 73,
    "phrase": "Go Beyond",
    "definition": "To do more than what is expected of you.",
    "example": "I commend your work; you always go beyond what I ask of you.",
    "chinese": "超越",
    "synonyms": [
      "exceed",
      "surpass"
    ]
  },
  {
    "id": 74,
    "phrase": "Go Off",
    "definition": "To express your anger verbally; to leave without warning; to leave the normal path.",
    "example": "Don’t go off into the woods alone.",
    "chinese": "爆響、離開、發作",
    "synonyms": [
      "explode",
      "leave"
    ]
  },
  {
    "id": 75,
    "phrase": "Go With",
    "definition": "To join; to combine; to match.",
    "example": "Those shoes don’t go with that dress.",
    "chinese": "配襯、一起",
    "synonyms": [
      "match",
      "accompany"
    ]
  },
  {
    "id": 76,
    "phrase": "Gross Out",
    "definition": "To feel disgusted by something.",
    "example": "The smell of that trash is grossing me out.",
    "chinese": "使作嘔",
    "synonyms": [
      "disgust",
      "repulse"
    ]
  },
  {
    "id": 77,
    "phrase": "Hand Back",
    "definition": "To return something after borrowing it.",
    "example": "Kyra handed the pencil back to me after her homework was finished.",
    "chinese": "歸還",
    "synonyms": [
      "return",
      "give back"
    ]
  },
  {
    "id": 78,
    "phrase": "Hang Around",
    "definition": "To be in a specific place for a period of time.",
    "example": "He hangs around the mall a lot.",
    "chinese": "逗留",
    "synonyms": [
      "linger",
      "loiter"
    ]
  },
  {
    "id": 79,
    "phrase": "Hold Against",
    "definition": "To refuse forgiving someone.",
    "example": "I hope you don’t hold this against me, but I don’t feel like going to the store with you.",
    "chinese": "記恨",
    "synonyms": [
      "resent",
      "blame"
    ]
  },
  {
    "id": 80,
    "phrase": "Hold Off",
    "definition": "To delay or prevent something.",
    "example": "Why don’t you hold off on mowing the lawn since it rained.",
    "chinese": "延遲",
    "synonyms": [
      "postpone",
      "delay"
    ]
  },
  {
    "id": 81,
    "phrase": "Hurry Up",
    "definition": "To quickly do something.",
    "example": "Hurry up with those burgers over there, we’re starving!",
    "chinese": "快點",
    "synonyms": [
      "rush",
      "speed up"
    ]
  },
  {
    "id": 82,
    "phrase": "Keep At",
    "definition": "To continue trying.",
    "example": "Keep at it, you’ll succeed eventually.",
    "chinese": "堅持",
    "synonyms": [
      "persist",
      "continue"
    ]
  },
  {
    "id": 83,
    "phrase": "Keep Down",
    "definition": "To minimize noise.",
    "example": "Keep it down up there we’re trying to sleep.",
    "chinese": "壓低聲量",
    "synonyms": [
      "quieten",
      "suppress"
    ]
  },
  {
    "id": 84,
    "phrase": "Keep Up",
    "definition": "To continue taking care of or doing something.",
    "example": "Jenny is struggling to keep up with her garden.",
    "chinese": "跟上、維持",
    "synonyms": [
      "maintain",
      "stay level"
    ]
  },
  {
    "id": 85,
    "phrase": "Kick Back",
    "definition": "To hang out; to relax.",
    "example": "Let’s kick back at the pool today.",
    "chinese": "放鬆",
    "synonyms": [
      "relax",
      "unwind"
    ]
  },
  {
    "id": 86,
    "phrase": "Knock Off",
    "definition": "To cause something to fall or stop.",
    "example": "Knock it off boys, there’s no reason to hit your brothers",
    "chinese": "停止、撞掉",
    "synonyms": [
      "stop",
      "remove"
    ]
  },
  {
    "id": 87,
    "phrase": "Knock Out",
    "definition": "To hit someone hard enough that they are unconscious; to be surprised.",
    "example": "That smile could knock a guy out.",
    "chinese": "擊暈",
    "synonyms": [
      "render unconscious",
      "stun"
    ]
  },
  {
    "id": 88,
    "phrase": "Lay Off",
    "definition": "To cut an employee’s job; to stop doing.",
    "example": "Lay off the chocolate son you’re going to get a headache.",
    "chinese": "裁員、停止",
    "synonyms": [
      "dismiss",
      "stop"
    ]
  },
  {
    "id": 89,
    "phrase": "Lead Up To",
    "definition": "When a series of certain events cause something to happen or occur.",
    "example": "All of you hard work has been leading up to this moment.",
    "chinese": "導致、鋪墊",
    "synonyms": [
      "precede",
      "culminate in"
    ]
  },
  {
    "id": 90,
    "phrase": "Leave Off",
    "definition": "To not include something, whether it be on purpose or an accident.",
    "example": "Let’s leave the Jones family off the guest list.",
    "chinese": "漏掉、停止在",
    "synonyms": [
      "omit",
      "stop"
    ]
  },
  {
    "id": 91,
    "phrase": "Leave Out",
    "definition": "To purposefully exclude.",
    "example": "Grace got left out of the plans for tonight because of the way she acted last time.",
    "chinese": "排除",
    "synonyms": [
      "exclude",
      "omit"
    ]
  },
  {
    "id": 92,
    "phrase": "Let Down",
    "definition": "To disappoint; to make lower or longer.",
    "example": "Please don’t let me down at the event this weekend.",
    "chinese": "令人失望",
    "synonyms": [
      "disappoint",
      "lower"
    ]
  },
  {
    "id": 93,
    "phrase": "Let In",
    "definition": "To allow; to invite.",
    "example": "After he burnt the chicken, we opened the window to let in some fresh air.",
    "chinese": "讓進來",
    "synonyms": [
      "admit",
      "allow in"
    ]
  },
  {
    "id": 94,
    "phrase": "Let On",
    "definition": "To allude to.",
    "example": "Kayla let on that Jeremy doesn’t really want to come tonight.",
    "chinese": "透露、暗示",
    "synonyms": [
      "reveal",
      "hint"
    ]
  },
  {
    "id": 95,
    "phrase": "Let Up",
    "definition": "To ease up.",
    "example": "Don’t let up on him, he deserves to be punished for wrecking the house.",
    "chinese": "減弱、放鬆",
    "synonyms": [
      "ease",
      "relent"
    ]
  },
  {
    "id": 96,
    "phrase": "Lighten Up",
    "definition": "To make less serious.",
    "example": "Oh, lighten up it was only a joke.",
    "chinese": "放輕鬆",
    "synonyms": [
      "relax",
      "take it easy"
    ]
  },
  {
    "id": 97,
    "phrase": "Line Up",
    "definition": "To create a row; to organize.",
    "example": "Line up at the end of the field, you boys are running.",
    "chinese": "排隊、排列",
    "synonyms": [
      "queue",
      "arrange"
    ]
  },
  {
    "id": 98,
    "phrase": "Lock In",
    "definition": "To secure; to save; to keep at a specific level.",
    "example": "Let’s lock in a date for vacation before our calendars fill up.",
    "chinese": "鎖定",
    "synonyms": [
      "secure",
      "fix"
    ]
  },
  {
    "id": 99,
    "phrase": "Lock Up",
    "definition": "To shut the doors or windows, to trap.",
    "example": "Please lock up before you leave.",
    "chinese": "鎖好、困住",
    "synonyms": [
      "secure",
      "imprison"
    ]
  },
  {
    "id": 100,
    "phrase": "Look Down On",
    "definition": "To believe you are better than someone or something.",
    "example": "Don’t look down on me just because I’m younger than you.",
    "chinese": "看不起",
    "synonyms": [
      "despise",
      "scorn"
    ]
  },
  {
    "id": 101,
    "phrase": "Look Forward To",
    "definition": "To anticipate with excitement.",
    "example": "I look forward to meeting you soon.",
    "chinese": "期待",
    "synonyms": [
      "anticipate",
      "await eagerly"
    ]
  },
  {
    "id": 102,
    "phrase": "Look Into",
    "definition": "To investigate further.",
    "example": "Police are still looking into the disappearance.",
    "chinese": "調查",
    "synonyms": [
      "investigate",
      "examine"
    ]
  },
  {
    "id": 103,
    "phrase": "Look Out",
    "definition": "To stay alert; to do a favor for someone.",
    "example": "Thanks for looking out for me, I wouldn’t have made it through school without you.",
    "chinese": "小心、照顧",
    "synonyms": [
      "beware",
      "watch over"
    ]
  },
  {
    "id": 104,
    "phrase": "Look Over",
    "definition": "To examine.",
    "example": "Let’s look over these papers together.",
    "chinese": "查看",
    "synonyms": [
      "review",
      "examine"
    ]
  },
  {
    "id": 105,
    "phrase": "Look Up To",
    "definition": "To respect or revere someone.",
    "example": "I look up to him as the father I never had.",
    "chinese": "尊敬",
    "synonyms": [
      "admire",
      "respect"
    ]
  },
  {
    "id": 106,
    "phrase": "Luck Out",
    "definition": "To unexpectedly experience luck.",
    "example": "I guess we lucked out this time finding a parking spot near the front.",
    "chinese": "走運",
    "synonyms": [
      "get lucky",
      "prosper"
    ]
  },
  {
    "id": 107,
    "phrase": "Make Up",
    "definition": "To create a story; to do something that is better than what you missed out on.",
    "example": "That didn’t happen, you’re making that up.",
    "chinese": "編造、和好",
    "synonyms": [
      "invent",
      "reconcile"
    ]
  },
  {
    "id": 108,
    "phrase": "Mess Up",
    "definition": "To be unorganized; to ruin.",
    "example": "You messed up my hair.",
    "chinese": "搞砸",
    "synonyms": [
      "ruin",
      "make a mistake"
    ]
  },
  {
    "id": 109,
    "phrase": "Mix Up",
    "definition": "To combine; to confuse; to upgrade or change.",
    "example": "Can you mix up the batter for me while I make the frostingti",
    "chinese": "混淆、混合",
    "synonyms": [
      "confuse",
      "blend"
    ]
  },
  {
    "id": 110,
    "phrase": "Monkey Around With",
    "definition": "To mess around; to be silly.",
    "example": "That’s enough monkeying around with your brothers.",
    "chinese": "胡鬧、亂碰",
    "synonyms": [
      "fool around",
      "meddle"
    ]
  },
  {
    "id": 111,
    "phrase": "Narrow Down",
    "definition": "To reduce your options.",
    "example": "Please narrow down the lunch options to two restaurants.",
    "chinese": "縮窄範圍",
    "synonyms": [
      "reduce",
      "shortlist"
    ]
  },
  {
    "id": 112,
    "phrase": "Pay Back",
    "definition": "To return money that you owe; to reciprocate.",
    "example": "I will pay you back when I find my wallet.",
    "chinese": "償還、報復",
    "synonyms": [
      "repay",
      "retaliate"
    ]
  },
  {
    "id": 113,
    "phrase": "Pay Up",
    "definition": "To give all the money you owe.",
    "example": "You are required to pay two months’ rent up before moving day.",
    "chinese": "付清",
    "synonyms": [
      "settle",
      "pay in full"
    ]
  },
  {
    "id": 114,
    "phrase": "Pay Off",
    "definition": "To repay; to give money in exchange for secrecy; to be rewarded for hard work.",
    "example": "Hard work pays off.",
    "chinese": "還清、有回報",
    "synonyms": [
      "repay",
      "succeed"
    ]
  },
  {
    "id": 115,
    "phrase": "Pick On",
    "definition": "To tease or bully.",
    "example": "Those kids always pick on my son.",
    "chinese": "欺負",
    "synonyms": [
      "bully",
      "tease"
    ]
  },
  {
    "id": 116,
    "phrase": "Pile Up",
    "definition": "To place or be in a pile.",
    "example": "That trash is really piling up.",
    "chinese": "堆積",
    "synonyms": [
      "accumulate",
      "stack up"
    ]
  },
  {
    "id": 117,
    "phrase": "Piss Off",
    "definition": "To make someone angry.",
    "example": "You better take your shoes off inside the house before you piss off your mom.",
    "chinese": "惹怒",
    "synonyms": [
      "anger",
      "annoy"
    ]
  },
  {
    "id": 118,
    "phrase": "Plan On",
    "definition": "To have the intention of doing.",
    "example": "I plan on being there around noon.",
    "chinese": "打算",
    "synonyms": [
      "intend",
      "expect"
    ]
  },
  {
    "id": 119,
    "phrase": "Plug In",
    "definition": "To connect to electricity.",
    "example": "My phone was about to die so I had to plug it in.",
    "chinese": "插電",
    "synonyms": [
      "connect",
      "power up"
    ]
  },
  {
    "id": 120,
    "phrase": "Point Out",
    "definition": "To bring attention to.",
    "example": "You didn’t have to point out the pimple on my chin, I know it’s there.",
    "chinese": "指出",
    "synonyms": [
      "indicate",
      "highlight"
    ]
  },
  {
    "id": 121,
    "phrase": "Print Out",
    "definition": "To create a paper copy.",
    "example": "Can you print out that flyerti",
    "chinese": "列印",
    "synonyms": [
      "print",
      "produce a hard copy"
    ]
  },
  {
    "id": 122,
    "phrase": "Pull Off",
    "definition": "To do successfully.",
    "example": "I can’t believe they pulled off the surprise.",
    "chinese": "成功完成",
    "synonyms": [
      "accomplish",
      "manage"
    ]
  },
  {
    "id": 123,
    "phrase": "Pull Over",
    "definition": "To drive onto the side of the road and stop.",
    "example": "The cops had her pull over because she had a taillight out.",
    "chinese": "靠邊停車",
    "synonyms": [
      "stop roadside",
      "draw over"
    ]
  },
  {
    "id": 124,
    "phrase": "Pull Through",
    "definition": "To recover; to continue through difficulty.",
    "example": "Let’s just pull through to the next parking spot.",
    "chinese": "康復、渡過",
    "synonyms": [
      "recover",
      "survive"
    ]
  },
  {
    "id": 125,
    "phrase": "Punch In",
    "definition": "To record time.",
    "example": "I punched in to work at 6 o’clock in the morning every day this week.",
    "chinese": "打卡",
    "synonyms": [
      "clock in",
      "register"
    ]
  },
  {
    "id": 126,
    "phrase": "Put Away",
    "definition": "To hide something in a specific place.",
    "example": "Put those toys away before someone trips on one of them.",
    "chinese": "收好",
    "synonyms": [
      "store",
      "tidy"
    ]
  },
  {
    "id": 127,
    "phrase": "Put Back",
    "definition": "To return to its original place; to postpone.",
    "example": "Put that broom back after you use it.",
    "chinese": "放回",
    "synonyms": [
      "return",
      "replace"
    ]
  },
  {
    "id": 128,
    "phrase": "Put In",
    "definition": "To place inside; to install; to contribute money.",
    "example": "Put those groceries in the refrigerator please.",
    "chinese": "放入、投入",
    "synonyms": [
      "insert",
      "contribute"
    ]
  },
  {
    "id": 129,
    "phrase": "Put Together",
    "definition": "To assemble; to plan; to position close together.",
    "example": "We can put together her dresser later today.",
    "chinese": "組裝",
    "synonyms": [
      "assemble",
      "organize"
    ]
  },
  {
    "id": 130,
    "phrase": "Put Up With",
    "definition": "To tolerate something that you don’t necessarily like.",
    "example": "I put up with a lot in my last relationship.",
    "chinese": "忍受",
    "synonyms": [
      "tolerate",
      "endure"
    ]
  },
  {
    "id": 131,
    "phrase": "Ring Up",
    "definition": "To call on the phone; to add up the total cost at a register.",
    "example": "The grocery clerk offered to ring us up on the register she just opened.",
    "chinese": "致電、結帳",
    "synonyms": [
      "call",
      "total"
    ]
  },
  {
    "id": 132,
    "phrase": "Rip Off",
    "definition": "To be asked to pay too much for something; to remove something from where it was using force.",
    "example": "Just rip off the band aid, it will only hurt for a second,",
    "chinese": "敲竹槓、撕掉",
    "synonyms": [
      "overcharge",
      "tear off"
    ]
  },
  {
    "id": 133,
    "phrase": "Rip Up",
    "definition": "To tear into pieces; to remove something off of a specific surface.",
    "example": "We had to rip up the carpet in the house we were fixing up.",
    "chinese": "撕碎",
    "synonyms": [
      "tear up",
      "shred"
    ]
  },
  {
    "id": 134,
    "phrase": "Rule Out",
    "definition": "To eliminate as possible.",
    "example": "They ruled him out as a suspect after his alibi checked out.",
    "chinese": "排除",
    "synonyms": [
      "eliminate",
      "exclude"
    ]
  },
  {
    "id": 135,
    "phrase": "Run Across",
    "definition": "To move from one side to another.",
    "example": "The fox ran across the road.",
    "chinese": "偶遇、跑過",
    "synonyms": [
      "encounter",
      "cross"
    ]
  },
  {
    "id": 136,
    "phrase": "Run Around",
    "definition": "To go from place to place quickly; to play while running.",
    "example": "I have been running around town all day.",
    "chinese": "到處奔波",
    "synonyms": [
      "rush around",
      "roam"
    ]
  },
  {
    "id": 137,
    "phrase": "Run Down",
    "definition": "To gradually get worse; to explain a plan; to quickly get lower.",
    "example": "Let me give you the run down of the night before we leave.",
    "chinese": "撞倒、衰退",
    "synonyms": [
      "deteriorate",
      "knock down"
    ]
  },
  {
    "id": 138,
    "phrase": "Run Into",
    "definition": "When two objects accidentally hit each other; to see someone you know unexpectedly; to have unexpected issues; to go inside quickly.",
    "example": "Can you run into the store and grab some apples for me pleaseti",
    "chinese": "偶遇、撞上",
    "synonyms": [
      "encounter",
      "collide"
    ]
  },
  {
    "id": 139,
    "phrase": "Run Over",
    "definition": "To be injured by a car; to practice all the way through; to continue past the allotted time; to explain again; to have too much liquid inside.",
    "example": "Football practice always runs over after a loss.",
    "chinese": "輾過、超時",
    "synonyms": [
      "hit",
      "exceed"
    ]
  },
  {
    "id": 140,
    "phrase": "Screw On",
    "definition": "To seal a container’s lid; to connect parts with a screw.",
    "example": "Screw that lid on tight or you’ll spill your drink.",
    "chinese": "旋上",
    "synonyms": [
      "fasten",
      "tighten"
    ]
  },
  {
    "id": 141,
    "phrase": "Screw Up",
    "definition": "To make a mess of something.",
    "example": "I screwed up the date by talking about myself too much.",
    "chinese": "搞砸",
    "synonyms": [
      "botch",
      "ruin"
    ]
  },
  {
    "id": 142,
    "phrase": "See About",
    "definition": "To look into doing something.",
    "example": "Let’s see about getting an extra bag of ice for the party.",
    "chinese": "查看、安排",
    "synonyms": [
      "investigate",
      "arrange"
    ]
  },
  {
    "id": 143,
    "phrase": "Sell Out",
    "definition": "To be rid of all available inventory; to give up your morals when doing something.",
    "example": "We better get there early before the tickets sell out.",
    "chinese": "售罄、出賣原則",
    "synonyms": [
      "run out",
      "betray"
    ]
  },
  {
    "id": 144,
    "phrase": "Settle Down",
    "definition": "To start living routinely with more stability; to relax.",
    "example": "Settle down before you get the dogs riled up.",
    "chinese": "安定、冷靜",
    "synonyms": [
      "calm down",
      "establish"
    ]
  },
  {
    "id": 145,
    "phrase": "Shake Up",
    "definition": "Shaking to mix something; to upset someone.",
    "example": "Shake up the orange juice before drinking it.",
    "chinese": "搖勻、震動",
    "synonyms": [
      "disturb",
      "mix"
    ]
  },
  {
    "id": 146,
    "phrase": "Show Off",
    "definition": "To display something in a large way.",
    "example": "He came by to show off his new truck.",
    "chinese": "炫耀",
    "synonyms": [
      "boast",
      "display"
    ]
  },
  {
    "id": 147,
    "phrase": "Shut Up",
    "definition": "To not talk.",
    "example": "My mom shouting at us is a great way to get us to shut up.",
    "chinese": "閉嘴",
    "synonyms": [
      "be quiet",
      "stop talking"
    ]
  },
  {
    "id": 148,
    "phrase": "Sign In",
    "definition": "To write your name down with the time and date you arrived; to input a username and password online.",
    "example": "We had to sign in at the front office before the doctor would see us.",
    "chinese": "登入、簽到",
    "synonyms": [
      "log in",
      "register"
    ]
  },
  {
    "id": 149,
    "phrase": "Sign Out",
    "definition": "To signify your departure by signing your name and the date; to exit online.",
    "example": "Be sure to sign out of your account on the library computer so that no one can access your information.",
    "chinese": "登出、簽走",
    "synonyms": [
      "log out",
      "check out"
    ]
  },
  {
    "id": 150,
    "phrase": "Sit Down",
    "definition": "To start sitting; to assist someone in sitting.",
    "example": "Please, sit down you’ve been on your feet all day.",
    "chinese": "坐下",
    "synonyms": [
      "take a seat",
      "be seated"
    ]
  },
  {
    "id": 151,
    "phrase": "Slow Down",
    "definition": "To start being slower.",
    "example": "Slow down I can’t understand what you’re saying when you talk that fast.",
    "chinese": "慢下來",
    "synonyms": [
      "decelerate",
      "ease off"
    ]
  },
  {
    "id": 152,
    "phrase": "Sneak In/Into",
    "definition": "To go inside somewhere without being detected.",
    "example": "Sneak into the back pew, we’re late and don’t want to disturb the service.",
    "chinese": "偷偷進入",
    "synonyms": [
      "enter secretly",
      "slip in"
    ]
  },
  {
    "id": 153,
    "phrase": "Sneak Out",
    "definition": "To leave secretly without being noticed.",
    "example": "Let’s sneak out tonight and go to the club.",
    "chinese": "偷偷離開",
    "synonyms": [
      "leave secretly",
      "slip out"
    ]
  },
  {
    "id": 154,
    "phrase": "Sort Out",
    "definition": "To resolve a misunderstanding; to place things into specific groups.",
    "example": "Paul wants to sort out the details before we leave for the trip.",
    "chinese": "解決、整理",
    "synonyms": [
      "resolve",
      "organize"
    ]
  },
  {
    "id": 155,
    "phrase": "Space Out",
    "definition": "To gravitate your attention elsewhere; to not focus on what’s around you.",
    "example": "I’m so tired that I keep spacing out and not hearing what she said to me.",
    "chinese": "走神",
    "synonyms": [
      "daydream",
      "lose focus"
    ]
  },
  {
    "id": 156,
    "phrase": "Stand Around",
    "definition": "To gather in one area instead of doing what you need to.",
    "example": "Quit standing around, we’ve got housework to do!",
    "chinese": "站着閒等",
    "synonyms": [
      "idle",
      "loiter"
    ]
  },
  {
    "id": 157,
    "phrase": "Stand For",
    "definition": "To back up or support.",
    "example": "The school won’t stand for bullying of any kind.",
    "chinese": "代表、容忍",
    "synonyms": [
      "represent",
      "tolerate"
    ]
  },
  {
    "id": 158,
    "phrase": "Start Off",
    "definition": "To begin; to have intentions to do something.",
    "example": "Jacob started off the weekend by sleeping in until noon.",
    "chinese": "開始",
    "synonyms": [
      "begin",
      "commence"
    ]
  },
  {
    "id": 159,
    "phrase": "Start Up",
    "definition": "To begin something; to make it work.",
    "example": "Start up the car, I will be outside in a second.",
    "chinese": "啟動",
    "synonyms": [
      "launch",
      "begin"
    ]
  },
  {
    "id": 160,
    "phrase": "Stay Out",
    "definition": "To leave your home; to not go inside; to remain uninvolved.",
    "example": "We wanted to stay out past midnight but got too tired.",
    "chinese": "在外逗留、避開",
    "synonyms": [
      "remain outside",
      "avoid"
    ]
  },
  {
    "id": 161,
    "phrase": "Stay Up",
    "definition": "To be above level ground; to be awake longer than usual.",
    "example": "Don’t stay up too late, you have school in the morning.",
    "chinese": "熬夜",
    "synonyms": [
      "remain awake",
      "not sleep"
    ]
  },
  {
    "id": 162,
    "phrase": "Step On",
    "definition": "To move quickly; to place your foot.",
    "example": "They’re coming after us, so step on the gas!",
    "chinese": "踩、加速",
    "synonyms": [
      "tread on",
      "accelerate"
    ]
  },
  {
    "id": 163,
    "phrase": "Stick Around",
    "definition": "To remain in one place for a while.",
    "example": "We better stick around for a bit after your grandmother’s surgery.",
    "chinese": "留下",
    "synonyms": [
      "remain",
      "stay"
    ]
  },
  {
    "id": 164,
    "phrase": "Stick Out",
    "definition": "To extend outward; to be recognized; to persevere.",
    "example": "It’s only a few more weeks, just stick it out.",
    "chinese": "突出、堅持到底",
    "synonyms": [
      "protrude",
      "persevere"
    ]
  },
  {
    "id": 165,
    "phrase": "Stick Up",
    "definition": "To put something where it can be seen more easily; to stand out from the group.",
    "example": "Your hair is all brushed and smooth besides one little piece that’s sticking up over here.",
    "chinese": "翹起、張貼",
    "synonyms": [
      "protrude",
      "post"
    ]
  },
  {
    "id": 166,
    "phrase": "Stick With",
    "definition": "To continue; to stay loyal; to endure an uncomfortable situation or person.",
    "example": "They always stick us good kids with the troublemakers.",
    "chinese": "堅持、忠於",
    "synonyms": [
      "continue",
      "remain loyal"
    ]
  },
  {
    "id": 167,
    "phrase": "Stop Over",
    "definition": "To visit for a moment; to stop quickly.",
    "example": "Can you stop over at the store for some milk before you get hometi",
    "chinese": "中途停留",
    "synonyms": [
      "visit briefly",
      "call in"
    ]
  },
  {
    "id": 168,
    "phrase": "Straighten Out",
    "definition": "To make straight; to fix an issue; to make someone’s attitude or behavior better.",
    "example": "Let’s straighten her out before the big day.",
    "chinese": "理順、糾正",
    "synonyms": [
      "fix",
      "resolve"
    ]
  },
  {
    "id": 169,
    "phrase": "Switch Off",
    "definition": "To turn something previously on to be off.",
    "example": "Switch off the oven once you’re done baking, so it doesn’t start a fire.",
    "chinese": "關掉",
    "synonyms": [
      "turn off",
      "deactivate"
    ]
  },
  {
    "id": 170,
    "phrase": "Switch On",
    "definition": "To turn something previously off to be on.",
    "example": "Switch on those lights, it’s way too dark in here.",
    "chinese": "開啟",
    "synonyms": [
      "turn on",
      "activate"
    ]
  },
  {
    "id": 171,
    "phrase": "Take Apart",
    "definition": "To disassemble or separate.",
    "example": "We have to take apart the giant bookshelves to get them inside the building.",
    "chinese": "拆開",
    "synonyms": [
      "disassemble",
      "dismantle"
    ]
  },
  {
    "id": 172,
    "phrase": "Take Out",
    "definition": "To remove; to withdraw money; to pay for a dinner, bowling, etc., to murder.",
    "example": "I had to take out $300 for the fair this weekend.",
    "chinese": "取出、帶外賣",
    "synonyms": [
      "remove",
      "withdraw"
    ]
  },
  {
    "id": 173,
    "phrase": "Take Up On",
    "definition": "To accept an invitation or offer.",
    "example": "My night just freed up, so I will take you up on those tacos.",
    "chinese": "接受提議",
    "synonyms": [
      "accept",
      "agree to"
    ]
  },
  {
    "id": 174,
    "phrase": "Talk Down To",
    "definition": "To talk to someone as if you are better and/or smarter than them.",
    "example": "Frank always talks down to her when he’s explaining something.",
    "chinese": "居高臨下地說",
    "synonyms": [
      "patronize",
      "belittle"
    ]
  },
  {
    "id": 175,
    "phrase": "Talk Into",
    "definition": "To convince.",
    "example": "I won’t let you talk me into buying anything else today.",
    "chinese": "說服去做",
    "synonyms": [
      "persuade",
      "convince"
    ]
  },
  {
    "id": 176,
    "phrase": "Talk Out Of",
    "definition": "To convince someone against something.",
    "example": "Nothing will talk her out of getting this tattoo.",
    "chinese": "說服不要做",
    "synonyms": [
      "dissuade",
      "deter"
    ]
  },
  {
    "id": 177,
    "phrase": "Talk To",
    "definition": "To converse with someone.",
    "example": "Jackie will talk to him about borrowing the car tomorrow.",
    "chinese": "交談",
    "synonyms": [
      "speak with",
      "converse"
    ]
  },
  {
    "id": 178,
    "phrase": "Tear Down",
    "definition": "To destroy physical or mentally.",
    "example": "They tore down the old spaghetti factory last year.",
    "chinese": "拆毀",
    "synonyms": [
      "demolish",
      "destroy"
    ]
  },
  {
    "id": 179,
    "phrase": "Tear Off",
    "definition": "To remove forcefully.",
    "example": "Nikki tore off a piece of chicken.",
    "chinese": "撕下",
    "synonyms": [
      "rip off",
      "detach"
    ]
  },
  {
    "id": 180,
    "phrase": "Tell Apart",
    "definition": "To differentiate.",
    "example": "The Hollow twins are too similar, I can’t tell them apart.",
    "chinese": "分辨",
    "synonyms": [
      "distinguish",
      "differentiate"
    ]
  },
  {
    "id": 181,
    "phrase": "Tell On",
    "definition": "To inform someone of something that happened but was not supposed to.",
    "example": "Poppy told on her brother after he broke their mom’s vase.",
    "chinese": "告狀",
    "synonyms": [
      "inform on",
      "report"
    ]
  },
  {
    "id": 182,
    "phrase": "Think About",
    "definition": "To ponder something before it happens; to have on your mind.",
    "example": "Julia can’t stop thinking about her date on Friday.",
    "chinese": "考慮",
    "synonyms": [
      "consider",
      "ponder"
    ]
  },
  {
    "id": 183,
    "phrase": "Think Ahead",
    "definition": "To plan for the future.",
    "example": "Luckily, mom thought ahead for the boat trip and brought plenty of snacks and drinks.",
    "chinese": "預先打算",
    "synonyms": [
      "plan ahead",
      "anticipate"
    ]
  },
  {
    "id": 184,
    "phrase": "Think Up",
    "definition": "To come up with an idea using your imagination.",
    "example": "I could never think up a movie like The Matrix on my own.",
    "chinese": "想出",
    "synonyms": [
      "invent",
      "devise"
    ]
  },
  {
    "id": 185,
    "phrase": "Throw Away",
    "definition": "To get rid of.",
    "example": "He threw those old muffins away once they started going bad.",
    "chinese": "丟掉",
    "synonyms": [
      "discard",
      "dispose of"
    ]
  },
  {
    "id": 186,
    "phrase": "Track Down",
    "definition": "To seek out and find.",
    "example": "It took forever to track down a copy of her new book, but I finally got one",
    "chinese": "找出",
    "synonyms": [
      "locate",
      "hunt down"
    ]
  },
  {
    "id": 187,
    "phrase": "Trade In",
    "definition": "To exchange an old item for something new.",
    "example": "My dad traded in his old truck to the dealership, then bought a nicer one.",
    "chinese": "折舊換新",
    "synonyms": [
      "exchange",
      "swap"
    ]
  },
  {
    "id": 188,
    "phrase": "Trick Into",
    "definition": "To persuade using dishonesty.",
    "example": "Josh tricked me into coming with him.",
    "chinese": "騙去做",
    "synonyms": [
      "deceive",
      "con"
    ]
  },
  {
    "id": 189,
    "phrase": "Try On",
    "definition": "To see how something fits on your body before buying it.",
    "example": "You better try those shorts on to make sure they fit correctly.",
    "chinese": "試穿",
    "synonyms": [
      "fit",
      "sample"
    ]
  },
  {
    "id": 190,
    "phrase": "Try Out",
    "definition": "To demonstrate a specific skill; to test something.",
    "example": "I want to try out that new Mexican restaurant in town.",
    "chinese": "試用",
    "synonyms": [
      "test",
      "sample"
    ]
  },
  {
    "id": 191,
    "phrase": "Turn Down",
    "definition": "To refuse an offer; to decrease something.",
    "example": "Please turn down the radio, I am trying to talk on the phone.",
    "chinese": "拒絕、調低",
    "synonyms": [
      "reject",
      "lower"
    ]
  },
  {
    "id": 192,
    "phrase": "Turn Off",
    "definition": "To stop from being on; to offend or cause someone to lose interest.",
    "example": "Someone being lazy is such a turn off, I prefer a hardworking man.",
    "chinese": "關掉、使反感",
    "synonyms": [
      "switch off",
      "repel"
    ]
  },
  {
    "id": 193,
    "phrase": "Turn On",
    "definition": "To stop from being off; to entice or cause aEraction; to suddenly become against someone.",
    "example": "I never expected the butler to turn on the family after all of his years of service.",
    "chinese": "開啟、突然攻擊",
    "synonyms": [
      "activate",
      "excite"
    ]
  },
  {
    "id": 194,
    "phrase": "Turn Over",
    "definition": "To flip to the other side; to pass on authority duties; to replace continuously.",
    "example": "After 25 years as HOA President, Bob turned over his duties to a younger member of the neighborhood.",
    "chinese": "翻轉、移交",
    "synonyms": [
      "flip",
      "hand over"
    ]
  },
  {
    "id": 195,
    "phrase": "Turn Up",
    "definition": "To increase volume; to be found; to learn though research.",
    "example": "That missing vehicle is bound to turn up somewhere.",
    "chinese": "調高、出現",
    "synonyms": [
      "increase",
      "appear"
    ]
  },
  {
    "id": 196,
    "phrase": "Use Up",
    "definition": "To exhaust the resources of something.",
    "example": "Did you use up the last of the peanut butter yesterdayti",
    "chinese": "用光",
    "synonyms": [
      "exhaust",
      "consume"
    ]
  },
  {
    "id": 197,
    "phrase": "Wake Up",
    "definition": "To finish sleeping; to become aware.",
    "example": "Hannah was supposed to wake up at 6 am, but she slept until noon.",
    "chinese": "醒來",
    "synonyms": [
      "awaken",
      "get up"
    ]
  },
  {
    "id": 198,
    "phrase": "Wash Off",
    "definition": "To clean using water.",
    "example": "After we went hiking in the rain, I had to wash off my boots with the hose.",
    "chinese": "洗掉",
    "synonyms": [
      "rinse",
      "clean off"
    ]
  },
  {
    "id": 199,
    "phrase": "Wash Up",
    "definition": "To clean yourself; to be carried ashore by water; to no longer be of any use.",
    "example": "You and your brothers need to go wash up before dinner.",
    "chinese": "洗手洗臉、沖上岸",
    "synonyms": [
      "clean oneself",
      "rinse"
    ]
  },
  {
    "id": 200,
    "phrase": "Watch Out",
    "definition": "To be cautious of something happening.",
    "example": "Watch out for deer when driving in the country at night.",
    "chinese": "小心",
    "synonyms": [
      "beware",
      "be careful"
    ]
  }
];
