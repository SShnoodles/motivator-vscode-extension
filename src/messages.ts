import { getLocale } from './i18n';

/** Built-in motivational messages keyed by locale. */
export const builtinMessages: Record<'zh' | 'en', string[]> = {
  zh: [
    "🌸 休息一下吧！你已经努力工作很久了，给自己一个小奖励~",
    "👀 眼睛累了吧？看看远处的风景，让眼睛放松一下吧！",
    "🦵 站起来走走吧，活动一下你的腿部肌肉，身体会感谢你的~",
    "💧 喝杯水吧！保持水分，你的身体会感谢你的！",
    "😌 深呼吸一下，放松肩膀和脖子，你做得很棒！",
    "⚡ 你今天的表现超级棒！短暂休息充充电，继续加油！",
    "🌟 小憩一会儿，效率会更高哦！优秀的你值得好好休息~",
    "🧘 伸个懒腰吧！背部需要放松，代码一会儿再写~",
    "⌨️ 活动活动手腕和手指，保护好你的小手~",
    "🚀 短暂的休息是为了走更远的路，你是最棒的！",
    "🌈 休息不是偷懒，是为了更好地出发！",
    "🍵 泡杯茶或咖啡，给自己一个小小的慰劳吧~",
    "🌙 照顾好自己才能照顾好代码，休息一会儿吧！",
    "✨ 你是最棒的！记得照顾好自己哦，健康最重要~",
    "🐱 连猫咪都知道要多休息，你也要好好休息哦！",
    "💪 劳逸结合才是王道！休息一下，然后再创造奇迹吧~",
    "🌺 闭上眼睛，深呼吸，让大脑重启一下，效果超棒的！",
    "🎮 离开屏幕，活动一下！你的健康比代码更重要~",
    "🌿 站起来，去窗边看看外面的世界，大自然能给你灵感~",
    "🎵 休息时间到！听首歌，放松一下疲惫的身心~",
  ],
  en: [
    "🌸 Time for a break! You've been working hard — you deserve a little reward~",
    "👀 Your eyes need a rest! Look at something far away and let them relax~",
    "🦵 Stand up and stretch! Move your legs — your body will thank you~",
    "💧 Drink some water! Staying hydrated keeps you sharp and healthy!",
    "😌 Take a deep breath, relax your shoulders and neck — you're doing great!",
    "⚡ You've been on fire today! A short break will recharge you — keep going!",
    "🌟 A little rest goes a long way! You deserve it, superstar~",
    "🧘 Stretch your back! It needs a break too — the code can wait~",
    "⌨️ Shake out your wrists and fingers — take care of those hands~",
    "🚀 A short rest is fuel for a longer journey — you've got this!",
    "🌈 Resting isn't slacking — it's recharging for what's next!",
    "🍵 Brew some tea or coffee — give yourself a little treat~",
    "🌙 Taking care of yourself means taking care of your code too — rest up!",
    "✨ You're amazing! Remember to look after yourself — health comes first~",
    "🐱 Even cats know the value of rest — you should too!",
    "💪 Work hard, rest smart — that's the way to do it!",
    "🌺 Close your eyes, breathe deep, let your brain reboot — it works wonders!",
    "🎮 Step away from the screen and move around — your health matters more than code~",
    "🌿 Stand up and look out the window — nature sparks creativity~",
    "🎵 Break time! Listen to a song and let your tired mind unwind~",
  ],
};

/**
 * Returns a random message from the custom list, or from the built-in list
 * matching the current locale.
 */
export function getRandomMessage(customMessages?: string[]): string {
  if (customMessages && customMessages.length > 0) {
    return customMessages[Math.floor(Math.random() * customMessages.length)];
  }
  const messages = builtinMessages[getLocale()];
  return messages[Math.floor(Math.random() * messages.length)];
}
