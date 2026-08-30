'use strict';

const QUIZ_OPEN_AT = Date.parse('2026-08-23T00:00:00+09:00');
const STORAGE_PREFIX = 'awajiTripQuizBest_';

const QUIZZES = {
    awaji: {
        categoryName: '淡路島クイズ',
        perfectTitle: '淡路島マスター！',
        passMessage: '淡路島の予習はバッチリ！',
        questions: [
            {
                question: '淡路島と神戸側の本州を結んでいる橋はどれ？',
                choices: [
                    '大鳴門橋',
                    '明石海峡大橋',
                    '瀬戸大橋',
                    '関門橋'
                ],
                answer: 1,
                explanation:
                    '明石海峡大橋は、神戸と淡路島を結ぶ世界最大級の吊り橋。淡路島へ向かう代表的な玄関口です。',
                detailUrl: 'sightseeing.html#spot-01'
            },
            {
                question: '淡路島が深く関わる、日本神話の有名な物語はどれ？',
                choices: [
                    '国生み神話',
                    '浦島太郎',
                    'かぐや姫',
                    '因幡の白うさぎ'
                ],
                answer: 0,
                explanation:
                    '『古事記』『日本書紀』では、淡路島は国生み神話と深い関わりを持つ島として語られています。',
                detailUrl: 'sightseeing.html#spot-03'
            },
            {
                question: '淡路島の南側、鳴門海峡で特に有名な自然現象はどれ？',
                choices: [
                    '流氷',
                    '間欠泉',
                    'うずしお',
                    '蜃気楼'
                ],
                answer: 2,
                explanation:
                    '鳴門海峡は大きなうずしおで有名。潮の満ち引きによる激しい潮流が、迫力ある渦を生み出します。',
                detailUrl: 'sightseeing.html#spot-04'
            },
            {
                question: '淡路島を代表する農産物として、特に有名なのはどれ？',
                choices: [
                    'たまねぎ',
                    'さくらんぼ',
                    'わさび',
                    '落花生'
                ],
                answer: 0,
                explanation:
                    '淡路島といえば、甘みのあるたまねぎが代表的な特産品。島内の料理やお土産でもよく登場します。',
                detailUrl: 'sightseeing.html#spot-04'
            },
            {
                question: '淡路島の南から徳島・四国方面へ渡るときに通る橋はどれ？',
                choices: [
                    '明石海峡大橋',
                    'しまなみ海道',
                    '大鳴門橋',
                    '瀬戸大橋'
                ],
                answer: 2,
                explanation:
                    '淡路島の南端と徳島県側を結ぶのは大鳴門橋。鳴門海峡のうずしおを望む景観でも知られています。',
                detailUrl: 'sightseeing.html#spot-04'
            }
        ]
    },

    hanasajiki: {
        categoryName: 'あわじ花さじきクイズ',
        perfectTitle: '花さじきマスター！',
        passMessage: '花と景色を楽しむ準備はバッチリ！',
        questions: [
            {
                question:
                    '「あわじ花さじき」という名前の「さじき」に込められたイメージは？',
                choices: [
                    '花を育てる畑の区画',
                    '景色を楽しむ見物席',
                    '昔の船着き場',
                    '島の方言で散歩道'
                ],
                answer: 1,
                explanation:
                    '眼下に広がる花のじゅうたんを楽しめる「極上の見物席＝さじき席」というイメージから名付けられました。',
                detailUrl: 'sightseeing.html#spot-02'
            },
            {
                question: 'あわじ花さじきは、どんな場所に広がる公園？',
                choices: [
                    '海抜ほぼ0mの砂浜',
                    '標高約300mの丘陵地',
                    '地下の植物園',
                    '山頂1500m級の高山'
                ],
                answer: 1,
                explanation:
                    '淡路島北部の標高約300mの丘陵地に、海へ向かってなだらかな花畑が広がっています。',
                detailUrl: 'sightseeing.html#spot-02'
            },
            {
                question: '園内の展望スポットから楽しめる景色として正しいものは？',
                choices: [
                    '明石海峡や大阪湾',
                    '富士山と芦ノ湖',
                    '琵琶湖と比叡山',
                    '桜島と錦江湾'
                ],
                answer: 0,
                explanation:
                    '高台からは花畑だけでなく、明石海峡や大阪湾など海の景色も一緒に楽しめます。',
                detailUrl: 'sightseeing.html#spot-02'
            },
            {
                question: 'あわじ花さじきの花畑の広さは、およそどれくらい？',
                choices: [
                    '約1ha',
                    '約5ha',
                    '約15ha',
                    '約100ha'
                ],
                answer: 2,
                explanation:
                    '花畑は約15ha。広い丘陵地に季節ごとの花がまとまって咲き、大きな景観をつくります。',
                detailUrl: 'sightseeing.html#spot-02'
            },
            {
                question:
                    '秋のあわじ花さじきを彩る代表的な花のひとつはどれ？',
                choices: [
                    'コスモス',
                    'チューリップ',
                    'アジサイ',
                    'ウメ'
                ],
                answer: 0,
                explanation:
                    '秋にはコスモスなどが花畑を彩ります。季節ごとに主役の花が変わるのも花さじきの魅力です。',
                detailUrl: 'sightseeing.html#spot-02'
            }
        ]
    },

    izanagi: {
        categoryName: '伊弉諾神宮クイズ',
        perfectTitle: '伊弉諾神宮マスター！',
        passMessage: '神話と境内の見どころをしっかり予習できています！',
        questions: [
            {
                question: '伊弉諾神宮でお祀りされている二柱の神様は？',
                choices: [
                    '伊弉諾大神と伊弉冉大神',
                    '天照大神と須佐之男命',
                    '大国主命と少彦名命',
                    '猿田彦命と天宇受売命'
                ],
                answer: 0,
                explanation:
                    '伊弉諾神宮では、国生み・神生みで知られる伊弉諾大神と伊弉冉大神をお祀りしています。',
                detailUrl: 'sightseeing.html#spot-03'
            },
            {
                question: '伊弉諾神宮と特に関わりが深い神話はどれ？',
                choices: [
                    '海幸彦・山幸彦',
                    '国生み・神生み',
                    'ヤマタノオロチ退治',
                    '天孫降臨だけ'
                ],
                answer: 1,
                explanation:
                    '伊弉諾大神・伊弉冉大神は国生み・神生みの中心となる神様で、淡路島とも深く結び付いています。',
                detailUrl: 'sightseeing.html#spot-03'
            },
            {
                question: '伊弉諾神宮の境内で有名な御神木の名前は？',
                choices: [
                    '夫婦大楠',
                    '千本杉',
                    '三本松',
                    '神代桜'
                ],
                answer: 0,
                explanation:
                    '境内の「夫婦大楠」は、伊弉諾大神・伊弉冉大神の神霊が宿る御神木として信仰されています。',
                detailUrl: 'sightseeing.html#spot-03'
            },
            {
                question: '「夫婦大楠」には、どんな特徴がある？',
                choices: [
                    '一本の木が途中で四本に分かれた',
                    '二株の木が成長して一株になった',
                    '海中から移植された',
                    '毎年葉の色が左右で入れ替わる'
                ],
                answer: 1,
                explanation:
                    'もとは二株だった楠が成長するにつれて合体し、一株になった珍しい木と伝えられています。',
                detailUrl: 'sightseeing.html#spot-03'
            },
            {
                question:
                    '夫婦大楠にまつわる信仰として、特に近いものはどれ？',
                choices: [
                    '交通安全だけ',
                    '学業成就だけ',
                    '夫婦円満・良縁・安産子宝',
                    '航海安全だけ'
                ],
                answer: 2,
                explanation:
                    '夫婦大楠は、夫婦円満や良縁、安産・子宝などの信仰を集める御神木として知られています。',
                detailUrl: 'sightseeing.html#spot-03'
            }
        ]
    },

    uzunooka: {
        categoryName: 'うずの丘 大鳴門橋記念館クイズ',
        perfectTitle: 'うずの丘マスター！',
        passMessage: 'うずの丘を楽しむ準備はバッチリ！',
        questions: [
            {
                question:
                    'うずの丘 大鳴門橋記念館の有名な巨大オブジェは？',
                choices: [
                    '巨大レモン',
                    'おっ玉葱®',
                    '巨大しいたけ',
                    'おっ鳴門®'
                ],
                answer: 1,
                explanation:
                    '名物は巨大なたまねぎオブジェ「おっ玉葱®」。淡路島らしい人気の記念撮影スポットです。',
                detailUrl: 'sightseeing.html#spot-04'
            },
            {
                question:
                    '「おっ玉葱®」と一緒に写真を撮るとき、背景に見える代表的な景色は？',
                choices: [
                    '大鳴門橋と鳴門海峡',
                    '明石城と六甲山',
                    '姫路城と瀬戸内海',
                    '神戸ポートタワーと市街地'
                ],
                answer: 0,
                explanation:
                    'おっ玉葱®の向こうには、大鳴門橋と鳴門海峡の雄大な景色が広がります。',
                detailUrl: 'sightseeing.html#spot-04'
            },
            {
                question:
                    '館内の「うずしお科学館」で楽しく学べるテーマは？',
                choices: [
                    '淡路島の鉄道史',
                    '鳴門海峡のうずしおの仕組み',
                    '宇宙開発',
                    '恐竜の進化'
                ],
                answer: 1,
                explanation:
                    'うずしお科学館では、映像や展示を通して鳴門海峡のうずしおができる仕組みを学べます。',
                detailUrl: 'sightseeing.html#spot-04'
            },
            {
                question:
                    'うずしお科学館の「ウズネタリウム」で使われているものは？',
                choices: [
                    '実物大の潜水艦',
                    'うずしおを再現する水理模型',
                    '本物の台風を起こす装置',
                    '海底トンネル'
                ],
                answer: 1,
                explanation:
                    'ウズネタリウムでは、水理模型で自然界のうずしおを再現し、映像と組み合わせて仕組みを学べます。',
                detailUrl: 'sightseeing.html#spot-04'
            },
            {
                question:
                    '「おっ玉葱®」での記念撮影をさらに楽しむため、貸し出されているものは？',
                choices: [
                    'たまねぎカツラ',
                    '渦潮柄の長靴',
                    '鳴門橋の模型帽子',
                    '巨大フォーク'
                ],
                answer: 0,
                explanation:
                    '公式案内では、記念撮影用に「たまねぎカツラ」も貸し出されています。家族写真にもぴったりです。',
                detailUrl: 'sightseeing.html#spot-04'
            }
        ]
    }
};

const quizApp = document.querySelector('#quiz-app');

const state = {
    currentKey: null,
    selections: [],
    submitted: false
};

function getBestScore(key) {
    try {
        const value = localStorage.getItem(`${STORAGE_PREFIX}${key}`);

        if (value === null) {
            return null;
        }

        const score = Number(value);

        return Number.isFinite(score) ? score : null;
    } catch (error) {
        return null;
    }
}

function saveBestScore(key, score) {
    const currentBest = getBestScore(key);

    const nextBest =
        currentBest === null
            ? score
            : Math.max(currentBest, score);

    try {
        localStorage.setItem(
            `${STORAGE_PREFIX}${key}`,
            String(nextBest)
        );
    } catch (error) {
        // localStorageが利用できない環境でも
        // クイズ自体はそのまま遊べるようにします。
    }

    return nextBest;
}

function getScoreStatus(bestScore) {
    if (bestScore === null) {
        return `
      <span class="quiz-card-status">
        未挑戦
      </span>
    `;
    }

    if (bestScore === 100) {
        return `
      <span class="quiz-card-status is-perfect">
        ★ PERFECT
      </span>
      <span class="quiz-best-score">
        最高得点 ${bestScore} / 100
      </span>
    `;
    }

    if (bestScore >= 80) {
        return `
      <span class="quiz-card-status is-passed">
        ✓ 合格
      </span>
      <span class="quiz-best-score">
        最高得点 ${bestScore} / 100
      </span>
    `;
    }

    return `
    <span class="quiz-card-status">
      挑戦済み
    </span>
    <span class="quiz-best-score">
      最高得点 ${bestScore} / 100
    </span>
  `;
}

function renderLockScreen() {
    quizApp.innerHTML = `
    <section
      class="quiz-lock"
      aria-labelledby="quiz-lock-title"
    >
      <div
        class="quiz-lock-icon"
        aria-hidden="true"
      >
        🔒
      </div>

      <span class="eyebrow">
        SIGHTSEEING QUIZ
      </span>

      <h1
        class="section-title"
        id="quiz-lock-title"
      >
        観光地クイズ
      </h1>

      <p class="quiz-lock-message">
        旅行当日に解放されます
      </p>

      <p class="quiz-open-date">
        2026.09.23 OPEN
      </p>

    </section>
  `;
}

function renderQuizList() {
    state.currentKey = null;
    state.selections = [];
    state.submitted = false;

    const scores = Object.keys(QUIZZES).map(
        (key) => getBestScore(key)
    );

    const allPassed = scores.every(
        (score) => score !== null && score >= 80
    );

    const allPerfect = scores.every(
        (score) => score === 100
    );

    let achievement = '';

    if (allPerfect) {
        achievement = `
      <div
        class="quiz-achievement is-perfect"
        role="status"
      >
        <strong>ALL PERFECT！</strong>
        <span>
          4つの観光地クイズ、すべて100点！
        </span>
      </div>
    `;
    } else if (allPassed) {
        achievement = `
      <div
        class="quiz-achievement"
        role="status"
      >
        <strong>全クイズ制覇！</strong>
        <span>
          4つすべてで80点以上を達成しました。
        </span>
      </div>
    `;
    }

    const cards = Object.entries(QUIZZES)
        .map(([key, quiz]) => {
            const bestScore = getBestScore(key);

            return `
        <article class="quiz-select-card">

          <div class="quiz-select-card-head">
            <h2>
              ${quiz.categoryName}
            </h2>

            <span>
              全5問 / 100点満点
            </span>
          </div>

          <div
            class="quiz-select-card-record"
            aria-label="挑戦記録"
          >
            ${getScoreStatus(bestScore)}
          </div>

          <button
            class="btn quiz-start-button"
            type="button"
            data-action="start"
            data-quiz-key="${key}"
          >
            挑戦する
          </button>

        </article>
      `;
        })
        .join('');

    quizApp.innerHTML = `
    <section
      class="quiz-top"
      aria-labelledby="quiz-list-title"
    >

      <div class="page-hero quiz-page-hero">

        <span class="eyebrow">
          SIGHTSEEING QUIZ
        </span>

        <h1
          class="page-title"
          id="quiz-list-title"
        >
          観光地クイズ
        </h1>

        <p class="page-lead">
          旅先のことをどれくらい知ってる？<br>
          気になるクイズに挑戦しよう！
        </p>

      </div>

      ${achievement}

      <div class="quiz-select-grid">
        ${cards}
      </div>

    </section>
  `;
}

function startQuiz(key) {
    if (!QUIZZES[key]) {
        return;
    }

    state.currentKey = key;

    state.selections = Array(
        QUIZZES[key].questions.length
    ).fill(null);

    state.submitted = false;

    renderQuizScreen();
    scrollQuizToTop();
}

function renderQuizScreen() {
    const quiz = QUIZZES[state.currentKey];

    if (!quiz) {
        return;
    }

    const questionsHtml = quiz.questions
        .map((item, questionIndex) => {
            const choicesHtml = item.choices
                .map((choice, choiceIndex) => `
          <button
            class="quiz-choice"
            type="button"
            data-action="choice"
            data-question-index="${questionIndex}"
            data-choice-index="${choiceIndex}"
            aria-pressed="false"
          >
            <span
              class="quiz-choice-mark"
              aria-hidden="true"
            ></span>

            <span>${choice}</span>
          </button>
        `)
                .join('');

            return `
        <article
          class="quiz-question-card"
          data-question-card="${questionIndex}"
        >

          <div class="quiz-question-number">
            Q${questionIndex + 1}
          </div>

          <h2 class="quiz-question-text">
            ${item.question}
          </h2>

          <div
            class="quiz-choices"
            aria-label="Q${questionIndex + 1} の選択肢"
          >
            ${choicesHtml}
          </div>

        </article>
      `;
        })
        .join('');

    quizApp.innerHTML = `
    <section
      class="quiz-playing"
      aria-labelledby="quiz-current-title"
    >

      <div class="quiz-playing-head">

        <span class="eyebrow">
          5 QUESTIONS
        </span>

        <h1
          class="section-title"
          id="quiz-current-title"
        >
          ${quiz.categoryName}
        </h1>

        <p>
          全5問で100点満点。
        </p>

      </div>

      <div class="quiz-question-list">
        ${questionsHtml}
      </div>

      <div class="quiz-submit-wrap">

        <p
          class="quiz-answer-progress"
          id="quiz-answer-progress"
          aria-live="polite"
        >
          0 / 5 問回答済み
        </p>

        <button
          class="btn quiz-submit-button"
          id="quiz-submit-button"
          type="button"
          data-action="submit"
          disabled
        >
          回答する
        </button>

      </div>

    </section>
  `;
}

function selectChoice(
    questionIndex,
    choiceIndex
) {
    if (
        state.submitted ||
        !QUIZZES[state.currentKey]
    ) {
        return;
    }

    state.selections[questionIndex] =
        choiceIndex;

    const card = quizApp.querySelector(
        `[data-question-card="${questionIndex}"]`
    );

    if (card) {
        card
            .querySelectorAll('.quiz-choice')
            .forEach((button) => {
                const isSelected =
                    Number(button.dataset.choiceIndex) ===
                    choiceIndex;

                button.classList.toggle(
                    'is-selected',
                    isSelected
                );

                button.setAttribute(
                    'aria-pressed',
                    String(isSelected)
                );
            });
    }

    updateAnswerProgress();
}

function updateAnswerProgress() {
    const answeredCount =
        state.selections.filter(
            (value) => value !== null
        ).length;

    const total =
        state.selections.length;

    const progress =
        quizApp.querySelector(
            '#quiz-answer-progress'
        );

    const submitButton =
        quizApp.querySelector(
            '#quiz-submit-button'
        );

    if (progress) {
        progress.textContent =
            `${answeredCount} / ${total} 問回答済み`;
    }

    if (submitButton) {
        submitButton.disabled =
            answeredCount !== total;
    }
}

function submitQuiz() {
    const quiz =
        QUIZZES[state.currentKey];

    if (
        !quiz ||
        state.submitted
    ) {
        return;
    }

    if (
        state.selections.some(
            (value) => value === null
        )
    ) {
        return;
    }

    state.submitted = true;

    const correctCount =
        quiz.questions.reduce(
            (count, question, index) => {
                return count + (
                    state.selections[index] ===
                        question.answer
                        ? 1
                        : 0
                );
            },
            0
        );

    const score =
        correctCount * 20;

    saveBestScore(
        state.currentKey,
        score
    );

    renderResult(score);
    scrollQuizToTop();
}

function getResultMessage(
    score,
    quiz
) {
    if (score === 100) {
        return {
            title: 'PERFECT！',
            message: quiz.perfectTitle,
            className: 'is-perfect'
        };
    }

    if (score >= 80) {
        return {
            title: '合格！',
            message: quiz.passMessage,
            className: 'is-passed'
        };
    }

    return {
        title: 'もう少しで合格！',
        message:
            '観光しながら答え合わせしてみよう',
        className: ''
    };
}

function renderResult(score) {
    const quiz =
        QUIZZES[state.currentKey];

    const detailUrl = {
        awaji: 'sightseeing.html',
        hanasajiki: 'sightseeing.html#spot-02',
        izanagi: 'sightseeing.html#spot-03',
        uzunooka: 'sightseeing.html#spot-04'
    }[state.currentKey];

    const resultMessage =
        getResultMessage(
            score,
            quiz
        );

    const scoreCat =
        score === 100
            ? `
    <div
          class="quiz-perfect-celebration"
          aria-label="100点のお祝い"
        >
          <img
            src="images/quiz/cat-100.png"
            alt="100点をお祝いする猫"
            class="quiz-perfect-cat"
          >
        </div>
      `
            : score === 80
                ? `
        <div
          class="quiz-perfect-celebration"
          aria-label="合格した猫"
        >
          <img
            src="images/quiz/cat-80.png"
            alt="合格したときの猫"
            class="quiz-perfect-cat"
          >
        </div>
      `
                : score <= 60
                    ? `
        <div
          class="quiz-perfect-celebration"
          aria-label="もう少しで合格の猫"
        >
          <img
            src="images/quiz/cat-0.png"
            alt="もう少しで合格の猫"
            class="quiz-perfect-cat"
          >
        </div>
  `
                    : '';

    const questionsHtml =
        quiz.questions
            .map((item, questionIndex) => {
                const selectedIndex =
                    state.selections[questionIndex];

                const isCorrect =
                    selectedIndex === item.answer;

                const choicesHtml =
                    item.choices
                        .map(
                            (
                                choice,
                                choiceIndex
                            ) => {
                                const classes = [
                                    'quiz-choice'
                                ];

                                let suffix = '';

                                if (
                                    choiceIndex ===
                                    item.answer
                                ) {
                                    classes.push(
                                        'is-correct-answer'
                                    );

                                    suffix = `
                    <span
                      class="quiz-choice-result-label"
                    >
                      正解
                    </span>
                  `;
                                }

                                if (
                                    choiceIndex ===
                                    selectedIndex &&
                                    !isCorrect
                                ) {
                                    classes.push(
                                        'is-wrong-answer'
                                    );

                                    suffix = `
                    <span
                      class="quiz-choice-result-label"
                    >
                      あなたの回答
                    </span>
                  `;
                                }

                                if (
                                    choiceIndex ===
                                    selectedIndex
                                ) {
                                    classes.push(
                                        'is-selected'
                                    );
                                }

                                return `
                  <button
                    class="${classes.join(' ')}"
                    type="button"
                    disabled
                    aria-pressed="${choiceIndex ===
                                    selectedIndex
                                    }"
                  >

                    <span
                      class="quiz-choice-mark"
                      aria-hidden="true"
                    ></span>

                    <span>
                      ${choice}
                    </span>

                    ${suffix}

                  </button>
                `;
                            }
                        )
                        .join('');

                return `
          <article
            class="
              quiz-question-card
              quiz-result-question
              ${isCorrect
                        ? 'is-correct'
                        : 'is-wrong'
                    }
            "
          >

            <div class="quiz-question-number">
              Q${questionIndex + 1}
            </div>

            <h2 class="quiz-question-text">
              ${item.question}
            </h2>

            <div
              class="quiz-choices"
              aria-label="Q${questionIndex + 1} の採点結果"
            >
              ${choicesHtml}
            </div>

            <div class="quiz-explanation">

              <strong class="quiz-judge">
                ${isCorrect
                        ? '✓ 正解'
                        : '× 不正解'
                    }
              </strong>

              <p>
                <b>正しい選択肢：</b>
                ${item.choices[
                    item.answer
                    ]
                    }
              </p>

              <p>
                ${item.explanation}
              </p>

            </div>

          </article>
        `;
            })
            .join('');

    quizApp.innerHTML = `
    <section
      class="quiz-result"
      aria-labelledby="quiz-result-title"
    >

      <div
        class="
          quiz-score-card
          ${resultMessage.className}
        "
        role="status"
        aria-live="polite"
      >

        <span class="eyebrow">
          RESULT
        </span>

        <div class="quiz-score">
          ${score}
          <span>/ 100</span>
        </div>

        <h1 id="quiz-result-title">
          ${resultMessage.title}
        </h1>

        <p>
          ${resultMessage.message}
        </p>

      </div>

      ${scoreCat}

      <div class="quiz-question-list">
        ${questionsHtml}
      </div>

      <div class="quiz-result-actions">

        <button
          class="btn"
          type="button"
          data-action="retry"
        >
          もう一度挑戦する
        </button>

        <a
          class="btn secondary quiz-detail-link"
          href="${detailUrl}"
        >
          観光地の詳細を見る
        </a>

        <button
          class="btn secondary"
          type="button"
          data-action="back"
        >
          クイズ一覧に戻る
        </button>

      </div>

    </section>
  `;
    if (score === 100) {
        playPerfectSound();
    } else if (score <= 60) {
        playFailureSound();
    }

}

function playPerfectSound() {
    const audio =
        new Audio(
            'sounds/quiz-perfect.mp3'
        );

    audio.volume = 1.0;

    audio.play().catch(() => {
        // ブラウザ側で自動再生が制限された場合は
        // 音を鳴らさず、そのまま結果を表示します。
    });
}

function playFailureSound() {
    const audio =
        new Audio(
            'sounds/quiz-failure.mp3'
        );

    audio.volume = 1.0;

    audio.play().catch(() => {
        // ブラウザ側で自動再生が制限された場合は
        // 音を鳴らさず、そのまま結果を表示します。
    });
}

function retryQuiz() {
    if (!state.currentKey) {
        return;
    }

    state.selections = Array(
        QUIZZES[
            state.currentKey
        ].questions.length
    ).fill(null);

    state.submitted = false;

    renderQuizScreen();
    scrollQuizToTop();
}

function scrollQuizToTop() {
    const reduceMotion =
        window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;

    window.scrollTo({
        top: 0,
        behavior:
            reduceMotion
                ? 'auto'
                : 'smooth'
    });
}

function handleQuizClick(event) {
    const target =
        event.target.closest(
            '[data-action]'
        );

    if (!target) {
        return;
    }

    const action =
        target.dataset.action;

    if (action === 'start') {
        startQuiz(
            target.dataset.quizKey
        );
    } else if (
        action === 'choice'
    ) {
        selectChoice(
            Number(
                target.dataset.questionIndex
            ),
            Number(
                target.dataset.choiceIndex
            )
        );
    } else if (
        action === 'submit'
    ) {
        submitQuiz();
    } else if (
        action === 'retry'
    ) {
        retryQuiz();
    } else if (
        action === 'back'
    ) {
        renderQuizList();
        scrollQuizToTop();
    }
}

function initializeQuiz() {
    if (!quizApp) {
        return;
    }

    quizApp.addEventListener(
        'click',
        handleQuizClick
    );

    if (
        Date.now() >=
        QUIZ_OPEN_AT
    ) {
        renderQuizList();
        return;
    }

    renderLockScreen();

    const unlockTimer =
        window.setInterval(() => {
            if (
                Date.now() >=
                QUIZ_OPEN_AT
            ) {
                window.clearInterval(
                    unlockTimer
                );

                renderQuizList();
            }
        }, 30000);
}

initializeQuiz();