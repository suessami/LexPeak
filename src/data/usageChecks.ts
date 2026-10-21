/**
 * "Use It Right" — review stage where the student sees one word and four
 * sentences, and picks EVERY sentence that uses the word correctly (1–3 are
 * right, varied so "it's always two" never works). Wrong sentences are
 * grammatical but misuse the meaning, so the item tests understanding, not
 * grammar. Each misused sentence carries a one-line Korean `why`, shown
 * after checking.
 *
 * Pilot: only reviews listed here get the stage.
 */
export interface UsageSentence {
  text: string;
  ok: boolean;
  /** One-line Korean reason, for misused sentences only. */
  why?: string;
}

export interface UsageCheck {
  wordId: string;
  sentences: UsageSentence[];
}

const ok = (text: string): UsageSentence => ({ text, ok: true });
const no = (text: string, why: string): UsageSentence => ({ text, ok: false, why });

export const USAGE_CHECKS: Record<number, UsageCheck[]> = {
  1: [
    {
      wordId: "u001-w1", // aroma
      sentences: [
        ok("The aroma of freshly baked bread filled the bakery."),
        no(
          "The aroma from the overflowing garbage bin made everyone cover their noses.",
          "aroma는 좋은 냄새야. 쓰레기 냄새는 odor.",
        ),
        ok("She loved the rich aroma of the coffee beans."),
        no(
          "The aroma of the teacher's voice calmed the students.",
          "aroma는 냄새라서 목소리에는 못 써.",
        ),
      ],
    },
    {
      wordId: "u001-w2", // adverse
      sentences: [
        ok("The medicine had no adverse effects on the patients."),
        no(
          "We were thrilled by the adverse weather — perfect for a picnic.",
          "adverse는 나쁜/불리한. 소풍하기 딱 좋은 날씨랑 안 맞아.",
        ),
        no(
          "She received adverse praise for her excellent work.",
          "칭찬은 좋은 거라 adverse랑 반대야.",
        ),
        no(
          "The team celebrated their adverse victory.",
          "승리를 축하하는데 '불리한'은 말이 안 돼.",
        ),
      ],
    },
    {
      wordId: "u001-w3", // beverage
      sentences: [
        ok("Hot beverages such as tea and cocoa are popular in winter."),
        no(
          "She ate the beverage with a fork and knife.",
          "beverage는 마시는 거야. 포크로 먹을 수 없어.",
        ),
        ok("The café offers a wide range of beverages, from juice to smoothies."),
        no(
          "We packed sandwiches and other beverages for lunch.",
          "샌드위치는 음료가 아니야. 'other beverages'라고 하면 샌드위치도 음료가 돼.",
        ),
      ],
    },
    {
      wordId: "u001-w4", // when it comes to ~
      sentences: [
        ok("When it comes to math, Jiho is the best in our class."),
        ok("She is very patient when it comes to teaching young kids."),
        no(
          "The package will arrive when it comes to Friday.",
          "'~에 관해서라면'이라는 뜻이지 시간이 아니야. 금요일까지는 by Friday.",
        ),
        ok("When it comes to cooking, my dad is an expert."),
      ],
    },
    {
      wordId: "u001-w5", // cluster
      sentences: [
        ok("A cluster of stars shone brightly in the night sky."),
        ok("The students stood in a small cluster near the door."),
        ok("Grapes grow in clusters on the vine."),
        no(
          "He lived alone in a single cluster at the edge of town.",
          "cluster는 여러 개가 모인 무리라서 혼자, 하나에는 못 써.",
        ),
      ],
    },
    {
      wordId: "u002-w1", // alternate
      sentences: [
        ok("The road was closed, so we took an alternate route."),
        no(
          "Her alternate answer was the only one she had.",
          "alternate는 '다른 선택지'야. 답이 하나뿐이면 대안이 될 수 없어.",
        ),
        no(
          "We need an alternate plan because the first one is working perfectly.",
          "원래 계획이 잘 되면 대안이 필요 없어.",
        ),
        ok("If it rains, the alternate venue will be the school gym."),
      ],
    },
    {
      wordId: "u002-w2", // conveys
      sentences: [
        ok("Her smile conveys how happy she is."),
        ok("The poem conveys a feeling of deep loss."),
        no(
          "She conveys a nap every afternoon.",
          "convey는 생각·감정을 전달하는 거야. 낮잠은 '자는' 거지.",
        ),
        ok("A simple bow can convey respect."),
      ],
    },
    {
      wordId: "u002-w3", // condensed
      sentences: [
        ok("Condensed milk is thick and very sweet."),
        no(
          "The juice was so condensed that it tasted like plain water.",
          "condensed는 진하게 만든 거야. 맹물 맛이면 반대지.",
        ),
        no(
          "She added water to make the sauce more condensed.",
          "물을 넣으면 오히려 묽어져.",
        ),
        no(
          "The tea was so condensed that I could barely taste it.",
          "진하면 맛이 더 강해야지, 거의 안 느껴질 수 없어.",
        ),
      ],
    },
    {
      wordId: "u002-w4", // bear in mind that ~
      sentences: [
        ok("Bear in mind that the library closes early on Sundays."),
        no(
          "Bear in mind that you can forget everything I just said.",
          "'기억해 둬'라고 하면서 '다 잊어도 돼'는 앞뒤가 안 맞아.",
        ),
        ok("When you write your essay, bear in mind that the word limit is 300."),
        no(
          "She bore in mind that it was raining, so she left her umbrella at home.",
          "비 온다는 걸 염두에 뒀다면 우산을 챙겼겠지.",
        ),
      ],
    },
    {
      wordId: "u002-w5", // contemporary
      sentences: [
        ok("The museum features contemporary art by living artists."),
        no(
          "Dinosaurs are contemporary animals that we can see in zoos today.",
          "공룡은 현재 시대의 동물이 아니야.",
        ),
        ok("The novel deals with contemporary issues like social media and climate change."),
        no(
          "The ancient Roman coins are the most contemporary items in the collection.",
          "고대 동전은 '현대의'와 정반대야.",
        ),
      ],
    },
    {
      wordId: "u003-w1", // take ~ into account
      sentences: [
        ok("The judges took her young age into account when scoring her performance."),
        no(
          "He took the bus into account to get to school.",
          "'고려하다'라는 뜻이지, 버스를 '타다'가 아니야.",
        ),
        no(
          "She took a photo into account at the wedding.",
          "사진을 '찍다'가 아니라 '고려하다'야.",
        ),
        no(
          "Please take your umbrella into account when you leave.",
          "우산을 '챙기다'가 아니야. 그건 take your umbrella.",
        ),
      ],
    },
    {
      wordId: "u003-w2", // intensifies
      sentences: [
        ok("The storm intensifies as it moves closer to the coast."),
        no(
          "The pain intensifies after I take the painkiller, so I feel much better.",
          "통증이 강해지면 더 아파야지, 나아질 수 없어.",
        ),
        no(
          "As the music fades out, the sound intensifies.",
          "소리가 점점 작아지는 건 intensify와 반대야.",
        ),
        no(
          "The cold intensifies as spring arrives and the snow melts.",
          "봄이 오면 추위는 약해지지.",
        ),
      ],
    },
    {
      wordId: "u003-w3", // cultivate
      sentences: [
        ok("Farmers cultivate rice in these fields."),
        ok("The family has cultivated this land for three generations."),
        ok("They cultivate vegetables in a small garden behind the house."),
        no(
          "He cultivated the fish in the river with a net.",
          "cultivate는 땅을 일궈 기르는 거야. 그물로 물고기를 '잡다'가 아니야.",
        ),
      ],
    },
    {
      wordId: "u003-w4", // divine
      sentences: [
        ok("The ancient Greeks believed that thunder was a sign of divine anger."),
        no(
          "The divine flat tire made us late for school.",
          "divine은 신과 관련된 거야. 펑크 난 타이어랑은 상관없어.",
        ),
        ok("Many cultures tell stories about divine beings who live in the sky."),
        no(
          "He was punished for his divine crime of stealing candy.",
          "사탕 훔친 게 신성할 리 없어.",
        ),
      ],
    },
    {
      wordId: "u003-w5", // humid
      sentences: [
        ok("Summer in Seoul is hot and humid."),
        no(
          "The desert air was so humid that my lips cracked.",
          "입술이 트는 건 건조해서야. humid는 습한 거고.",
        ),
        ok("The bathroom gets humid after a hot shower."),
        no(
          "To dry the towels quickly, we hung them in the humid basement.",
          "습한 곳에서는 빨래가 빨리 안 말라.",
        ),
      ],
    },
  ],
};

export function getUsageChecks(reviewNo: number): UsageCheck[] {
  return USAGE_CHECKS[reviewNo] ?? [];
}
