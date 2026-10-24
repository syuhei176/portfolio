export interface CaseStudy {
  id: string;
  incidentId: string;
  title: string;
  lede: string;
  steps: { title: string; body: string }[];
  code?: { caption: string; source: string };
  takeaway: string;
}

export const caseStudies: CaseStudy[] = [
  {
    id: "bybit",
    incidentId: "bybit",
    title: "Bybit：署名者が見た画面と、実際に署名した中身",
    lede: "2025年2月21日、Bybit の ETH コールドウォレットから約40万 ETH、約14.6億ドルが流出した。単独の事件として暗号資産史上最大の被害である。コントラクトにもハードウェアウォレットにもバグはなかった。攻撃者が侵入したのは Bybit ではなく、署名に使う Web アプリ Safe{Wallet} の配信基盤だった。",
    steps: [
      {
        title: "開発者の端末を侵害する",
        body: "2月4日、Safe{Wallet} の開発者の macOS 端末が、Docker のプロジェクトを実行させるソーシャルエンジニアリングで侵害された。攻撃者は盗んだ AWS のセッショントークンで多要素認証を迂回し、翌日から Safe の AWS 環境に入り込んだ。",
      },
      {
        title: "配信される JavaScript を書き換える",
        body: "2月19日、S3 から配信される app.safe.global の JavaScript に、Bybit のウォレットからの取引のときだけ動き、署名の直前に取引の内容を差し替えるコードを注入した。他の利用者には何も起きないため、気づかれにくかった。",
      },
      {
        title: "定例の送金に見せかけて署名させる",
        body: "2月21日、Bybit の署名者はコールドウォレットからウォームウォレットへの定例の送金として、正規の URL の画面から Ledger で署名した。実際に署名されたのは、operation=1（delegatecall）で攻撃者のコントラクトを呼ぶ execTransaction だった。ハードウェアウォレットには、中身が読める形では表示されなかった。",
      },
      {
        title: "実装アドレスを書き換える",
        body: "delegatecall は、呼び出し先のコードを Safe 自身のストレージの上で実行する。攻撃者のコントラクトの transfer() は、ストレージのスロット0、つまりプロキシが参照する実装アドレス（masterCopy）を、攻撃者が用意したコントラクトに書き換えた。",
      },
      {
        title: "署名なしで全額を引き出す",
        body: "新しい実装には sweepETH() と sweepERC20() があり、攻撃者は追加の署名なしで ETH、stETH、mETH などを引き出した。",
      },
      {
        title: "痕跡を消す",
        body: "実行の約2分後、S3 上の JavaScript は正規のものに戻された。",
      },
    ],
    code: {
      caption: "実際に署名された Safe のトランザクション。Sygnia と NCC Group の分析をもとに簡略化し、アドレスは一部を省略した。",
      source: `execTransaction(
  to        = 0x9622…7242,                // 攻撃者のコントラクト
  value     = 0,
  data      = transfer(0xbDd0…9516, 0),   // 新しい実装のアドレス
  operation = 1,                          // delegatecall
  ...
)

// 攻撃者のコントラクトの transfer() は Safe のストレージ上で実行され、
// slot 0（masterCopy）を 0xbDd0…9516 に書き換える。
// 以後、Safe のプロキシは攻撃者の実装を呼ぶ。`,
    },
    takeaway:
      "閾値3のマルチシグでも、全員が同じ UI を信じて署名すれば、そのUIが単一障害点になる。署名者が to と operation を別の環境でデコードしていれば delegatecall に気づけたし、Safe の Guard で delegatecall を拒否していれば、署名が揃っても実行は止まった。攻撃されたのは、最も頻度が低く、最も慎重に扱われているはずのコールドウォレットの操作だった。",
  },
  {
    id: "drift",
    incidentId: "drift",
    title: "Drift：半年かけた接触と、失効しない事前署名",
    lede: "2026年4月1日、Solana の無期限先物取引所 Drift から約2.85億ドルが流出した。攻撃者はコードの欠陥を一つも使っていない。約半年かけて関係者の信頼を得て、管理権限を移すトランザクションに署名させ、それを好きなときに実行した。",
    steps: [
      {
        title: "取引会社を装って近づく",
        body: "攻撃者はクオンツの取引会社を装い、約半年にわたって Drift の関係者と関係を築いた。",
      },
      {
        title: "無害に見える事前署名を集める",
        body: "3月下旬、Security Council のメンバーに、無害に見えて実際には管理権限を移すトランザクションへ署名させた。Solana の durable nonce を使うと、署名済みのトランザクションは通常の約90秒で失効せず、いつでも実行できる。",
      },
      {
        title: "タイムロックのない体制に移る",
        body: "3月26日、Drift はタイムロックのない 2-of-5 の Security Council に移行した。攻撃者は、この新しい体制の署名者からも署名を得ていた。",
      },
      {
        title: "管理権限を奪う",
        body: "4月1日16時05分（UTC）、攻撃者は保持していた事前署名のトランザクション2つを1秒違いで実行し、管理権限を握った。",
      },
      {
        title: "偽の担保で実資産を借りる",
        body: "管理者として、自作の CarbonVote Token（CVT）を担保に登録し、自分が操作する価格で約1ドルに見せかけた。5億 CVT を預け、約2.5時間で JLP、USDC、cbBTC など18種類以上の実資産を引き出して Ethereum へ移した。",
      },
    ],
    takeaway:
      "どの一歩も、コントラクトは仕様どおりに動いている。止められた地点は3つあった。署名者が中身をデコードして権限の移譲だと気づくこと、durable nonce を使った事前署名を監視すること、権限の変更にタイムロックを置くこと。最後の一つがあれば、管理権限が移る前に気づく時間があった。",
  },
  {
    id: "euler",
    incidentId: "euler",
    title: "Euler：健全性チェックが1つ抜けた寄付関数",
    lede: "2023年3月13日、レンディングプロトコルの Euler から約1.97億ドルが流出した。原因は、担保だけを減らせる関数に健全性チェックがなかったこと。何度も監査を受けたコードに、後から加えた一つの関数が穴を開けた。",
    steps: [
      {
        title: "フラッシュローンで元手を作る",
        body: "Aave から 3,000万 DAI を借り、2,000万 DAI を Euler に預けて eDAI（担保）を得る。",
      },
      {
        title: "自己借入でレバレッジをかける",
        body: "mint() で約1.96億 eDAI と2億 dDAI（負債）を同時に作り、1,000万 DAI を返済してから、もう一度 mint() する。",
      },
      {
        title: "寄付で自らを債務超過にする",
        body: "donateToReserves() で1億 eDAI を準備金に寄付する。担保だけが減って負債はそのままなので、口座は大きな債務超過になる。この関数は、寄付の後に checkLiquidity() を呼んでいなかった。",
      },
      {
        title: "自分で清算する",
        body: "別のアドレスから、この債務超過の口座を清算する。Euler の清算は債務超過が深いほど割引が大きく（最大20%）、清算する側は担保を割安に引き取り、負債の一部だけを引き継ぐ。",
      },
      {
        title: "引き出して返済する",
        body: "清算した側の口座に残った担保を引き出してフラッシュローンを返し、差額が利益になる。同じ手順を WBTC、stETH、USDC の市場でも繰り返した。",
      },
    ],
    code: {
      caption: "EToken の donateToReserves と withdraw の比較。構造を示すために大幅に簡略化した。",
      source: `function donateToReserves(uint subAccountId, uint amount) external nonReentrant {
    address account = getSubAccount(msg.sender, subAccountId);
    // 担保（eToken）だけを減らし、準備金に移す
    users[account].balance -= amount;
    reserveBalance += amount;
    // ここで checkLiquidity(account) を呼んでいない
}

function withdraw(uint subAccountId, uint amount) external nonReentrant {
    address account = getSubAccount(msg.sender, subAccountId);
    users[account].balance -= amount;
    ...
    checkLiquidity(account);   // 他の関数は最後に健全性を確かめる
}`,
    },
    takeaway:
      "donateToReserves() は2022年7月のアップグレード（eIP-14）で追加された。問題は追加された関数そのものより、既存の清算ロジックとの組み合わせにあった。「残高が変わったら必ず健全性を確かめる」という不変条件を、関数ごとではなくプロトコル全体のテストとして書いていれば、ファジングで見つかる種類のバグだった。Euler は交渉で全額を取り戻したが、これは例外的な結末である。",
  },
  {
    id: "cetus",
    incidentId: "cetus",
    title: "Cetus：オーバーフロー検査そのもののバグ",
    lede: "2025年5月22日、Sui 上の DEX Cetus から約2.23億ドルが流出した。原因は Cetus 自身のコードではなく、依存していた数学ライブラリのオーバーフロー検査の条件式だった。",
    steps: [
      {
        title: "フラッシュスワップで価格を動かす",
        body: "攻撃者はフラッシュスワップで資金を借り、プールの価格を大きく動かす。",
      },
      {
        title: "極端に狭い価格帯を選ぶ",
        body: "tick の範囲 [300000, 300200] という極端に狭い価格帯を指定し、巨大な流動性でポジションを開こうとする。",
      },
      {
        title: "必要な預け入れ量の計算が壊れる",
        body: "必要なトークン量を計算する途中で checked_shlw(n) が呼ばれる。n は 2^192 を超えていて、64ビット左シフトすると桁があふれるが、誤った条件式はこれを安全と判定した。Move の左シフトは abort せず上位ビットを切り捨てるので、必要な量は1単位にまで小さくなった。",
      },
      {
        title: "流動性を引き出す",
        body: "1単位のトークンで発行された巨大な流動性を引き出してプールの資産を抜き取り、フラッシュスワップを返済する。これを複数のプールで繰り返した。",
      },
      {
        title: "バリデータが凍結する",
        body: "Sui のバリデータが対応し、約1.62億ドルを凍結した。資金の回収は、その後のオンチェーン投票で承認された。",
      },
    ],
    code: {
      caption: "integer-mate の checked_shlw（簡略化）。",
      source: `public fun checked_shlw(n: u256): (u256, bool) {
    let mask = 0xffffffffffffffff << 192;
    if (n > mask) {          // 本来は n >= 1 << 192 を拒否すべき
        (0, true)            // オーバーフロー
    } else {
        ((n << 64), false)   // 2^192 以上の値もここに来て、上位ビットが失われる
    }
}`,
    },
    takeaway:
      "「checked」と名の付くヘルパーは、呼ぶ側が安全だと信じてしまう。問題の関数はプロトコル本体の外の依存ライブラリにあり、監査の範囲から外れやすかった。2^192 の前後の値を一つテストするだけで見つかるバグで、算術ライブラリこそ形式検証の対象にすべきだった。バリデータによる凍結は被害を抑えた一方で、チェーンがアプリの資金を止められることの是非も問うた。",
  },
];
