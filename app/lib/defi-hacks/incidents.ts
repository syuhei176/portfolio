import type { Incident } from "./taxonomy";

export const incidents: Incident[] = [
  {
    id: "the-dao",
    name: "The DAO",
    date: "2016-06-17",
    chain: "Ethereum",
    target: "defi",
    category: "reentrancy",
    lossUsdM: 60,
    lossNote:
      "約360万ETH（The DAO が集めた ETH の約3分の1）。当時の評価額は資料により約5,000万〜6,000万ドル。",
    recovered:
      "2016年7月20日のハードフォークで、トークン保有者が ETH を償還できるようにした。",
    summary: "送金の後で残高を減らす実装に再入され、約360万ETHが子DAOへ流出した。",
    mechanism:
      "splitDAO() は持分の ETH を子DAOへ移したあと withdrawRewardFor() を呼び、その中の payOut() が _recipient.call.value(_amount)() で呼び出し元に送金していた。残高のゼロ化と totalSupply の減算は、この外部呼び出しの後に行われていた。攻撃者のコントラクトは送金を受けた fallback から再び splitDAO() を呼び、残高が減る前の状態で同じ持分の ETH を何度も移させた。子DAOの仕様で資金は27日間引き出せず、その間にコミュニティは対応を議論した。",
    rootCause: "外部呼び出しを状態の更新より前に行い、再入ガードもなかった。",
    aftermath:
      "Ethereum はハードフォークで資金を保有者に戻し、フォークしなかったチェーンが Ethereum Classic として残った。SEC は2017年の報告書で DAO トークンを証券と判断した。攻撃者は訴追されていない。",
    lesson:
      "状態の更新を外部呼び出しより先に行い（Checks-Effects-Interactions）、外部呼び出しを含む関数は再入される前提でテストする。",
    sources: [
      {
        label: "Ethereum Foundation: CRITICAL UPDATE Re: DAO Vulnerability",
        url: "https://blog.ethereum.org/2016/06/17/critical-update-re-dao-vulnerability",
      },
      {
        label: "Ethereum Foundation: Hard Fork Completed",
        url: "https://blog.ethereum.org/2016/07/20/hard-fork-completed",
      },
      {
        label: "SEC: Report of Investigation (The DAO)",
        url: "https://www.sec.gov/litigation/investreport/34-81207.pdf",
      },
    ],
  },
  {
    id: "parity-multisig",
    name: "Parity マルチシグ（盗難）",
    date: "2017-07-19",
    chain: "Ethereum",
    target: "wallet",
    category: "logic",
    lossUsdM: 30,
    lossNote:
      "153,037 ETH（Edgeless、Swarm City、æternity の3つのウォレット）。約3,000万〜3,400万ドル。",
    recovered:
      "攻撃者からの回収はない。White Hat Group が同じ脆弱性を使って、残る脆弱なウォレットから約37.7万ETHを先に退避させ、所有者に返した。",
    summary: "初期化関数を誰でも呼べたため、ウォレットの所有者を書き換えられた。",
    mechanism:
      "Parity のマルチシグウォレットは、ロジックを共有ライブラリ WalletLibrary に置き、fallback で受けた呼び出しをすべて delegatecall でライブラリへ転送していた。本来デプロイ時に一度だけ呼ぶ initWallet() には初期化済みかどうかの確認がなく、ウォレット経由で誰でも実行できた。攻撃者は既存のウォレットに initWallet() を呼んで所有者を自分だけ・必要承認数1に書き換え、execute() で残高を送金した。",
    rootCause:
      "初期化関数に「初期化済み」のガードがなく、delegatecall 経由で外部から所有者を再設定できた。",
    aftermath:
      "攻撃者は特定されていない。Parity は翌日に修正版のライブラリをデプロイしたが、このライブラリ自体が未初期化のまま残り、11月の凍結につながった。",
    lesson:
      "初期化関数は一度しか実行できないようにし、delegatecall で処理を委譲する設計では外部から届く関数を洗い出してアクセス制御を確かめる。",
    sources: [
      {
        label: "OpenZeppelin: On the Parity Wallet Multisig Hack",
        url: "https://www.openzeppelin.com/news/on-the-parity-wallet-multisig-hack-405a8c12e8f7",
      },
      {
        label: "Parity Multisig Recovery Reconciliation",
        url: "https://github.com/bokkypoobah/ParityMultisigRecoveryReconciliation",
      },
    ],
  },
  {
    id: "parity-freeze",
    name: "Parity マルチシグ（凍結）",
    date: "2017-11-06",
    chain: "Ethereum",
    target: "wallet",
    category: "logic",
    lossUsdM: 154,
    lossNote:
      "盗難ではなく永久凍結。587のウォレットで513,774 ETH が動かせなくなった。評価額は換算時点により約1.5億〜3億ドル。うち約30.6万ETHは Polkadot の ICO 資金。",
    recovered:
      "なし。ライブラリを復元する EIP-999 は2018年の投票で支持を得られず、資金は今も凍結されている。",
    summary: "共有ライブラリが自己破壊され、それに依存する全ウォレットの資金が動かせなくなった。",
    mechanism:
      "7月の事件後にデプロイされた WalletLibrary は、ウォレットから delegatecall で使われる前提だったため、ライブラリ自身のストレージは未初期化のままだった。あるユーザーがライブラリに直接 initWallet() を呼ぶと所有者になれてしまい、続けて所有者限定の kill() を実行したことで、ライブラリは selfdestruct で消滅した。ロジックをこのライブラリに委譲していたウォレットは、引き出しを含むあらゆる操作ができなくなった。",
    rootCause:
      "共有ライブラリが未初期化で誰でも所有者になれ、しかも selfdestruct を実行できる関数を持っていた。",
    aftermath:
      "実行したユーザーは GitHub の issue で「誤って実行した」と報告した。ハードフォークによる救済案は否決された。",
    lesson:
      "実装コントラクトはデプロイ時に初期化するか初期化できないようにし、委譲先に selfdestruct や所有者変更のような破壊的な機能を持たせない。",
    sources: [
      {
        label: "DN Institute: Parity Wallet Freeze",
        url: "https://dn.institute/research/cyberattacks/incidents/2017-11-06-parity/",
      },
      {
        label: "GitHub: openethereum/parity-ethereum #6995",
        url: "https://github.com/openethereum/parity-ethereum/issues/6995",
      },
    ],
  },
  {
    id: "bzx",
    name: "bZx",
    date: "2020-02-15",
    chain: "Ethereum",
    target: "defi",
    category: "economic",
    lossUsdM: 0.95,
    lossNote:
      "2月15日と18日の2回の攻撃の合計。攻撃者の利益は約1,194 ETH と約2,381 ETH。",
    recovered: "返還はない。bZx が保険基金などで損失を負担した。",
    summary:
      "フラッシュローンが攻撃に使われた最初期の事例。DEX の価格を動かし、割高な価格での売り抜けや担保の過大評価に使った。",
    mechanism:
      "1回目は、dYdX から借りた 10,000 ETH を元手に Compound から WBTC を借り、bZx で ETH の5倍ショート（WBTC に対するロング）を開いた。bZx はこのポジションのために約5,600 ETH を流動性の薄い Uniswap V1 の WBTC/ETH プールで WBTC に替えたため WBTC の価格が約3倍になり、攻撃者は Compound で借りた WBTC を、つり上がった価格で同じプールに売り抜けた。本来ポジションの健全性を確かめる shouldLiquidate() は、条件式のバグで呼ばれなかった。2回目は、sUSD の DEX 価格を約2.5倍につり上げ、その価格を参照する bZx で、過大評価された sUSD を担保に ETH を借り出した。",
    rootCause:
      "単一の DEX の即時価格を担保評価と約定に使い、さらに健全性チェックが条件式のバグで飛ばされていた。",
    aftermath:
      "bZx は Chainlink のオラクルに移行した。後に Ooki DAO へ改組し、2023年に CFTC の訴訟で欠席判決を受けた。",
    lesson:
      "担保評価には操作されにくい価格源を使い、取引後のポジションの健全性はすべての経路で確かめる。",
    sources: [
      {
        label: "Qin et al.: Attacking the DeFi Ecosystem with Flash Loans for Fun and Profit",
        url: "https://arxiv.org/pdf/2003.03810",
      },
      {
        label: "palkeo: bZx hack analysis",
        url: "https://www.palkeo.com/en/projets/ethereum/bzx.html",
      },
    ],
  },
  {
    id: "harvest",
    name: "Harvest Finance",
    date: "2020-10-26",
    chain: "Ethereum",
    target: "defi",
    category: "economic",
    lossUsdM: 24,
    lossNote: "公式ドキュメントでは約2,400万ドル、当時の事後報告では約3,380万ドル。",
    recovered:
      "攻撃者が理由を示さずに約250万ドルを返送し、被害者に按分した。残りは将来の収益で償還するトークン GRAIN で補償した。",
    summary: "Curve プールの資産比率を動かしてシェア価格を下げ、安く預けて高く引き出した。",
    mechanism:
      "Harvest の fUSDC・fUSDT Vault は資金を Curve の Y プールに投資し、預け入れと引き出しのシェア価格をそのプールの資産比率から計算していた。攻撃者はフラッシュスワップで借りた資金で Curve 上の USDC と USDT を大量に交換してシェア価格を約1%下げ、その状態で大口の預け入れをし、逆方向の交換で価格を戻してから引き出した。Vault には価格の乖離が3%を超えると止まる検査があったが、1%の操作はその範囲に収まった。この往復を数十回繰り返した。",
    rootCause:
      "Vault のシェア価格を、同じトランザクションの中で動かせる Curve プールの瞬間的な状態から計算し、乖離の許容幅も大きすぎた。",
    aftermath: "攻撃者は特定されていない。FARM トークンの価格は大きく下落した。",
    lesson:
      "預け入れと引き出しの評価には操作されにくい価格を使い、同じブロック内の預け入れと引き出しを禁じるなど、フラッシュローンを前提に設計する。",
    sources: [
      {
        label: "Harvest Finance: fUSDC/fUSDT economic attack (Oct 26, 2020)",
        url: "https://docs.harvest.finance/other/security/incidents/fusdc-fusdt-economic-attack-oct-26-2020",
      },
      { label: "rekt: Harvest Finance", url: "https://rekt.news/harvest-finance-rekt/" },
    ],
  },
  {
    id: "badger",
    name: "BadgerDAO",
    date: "2021-12-02",
    chain: "Ethereum",
    target: "defi",
    category: "supply-chain",
    lossUsdM: 120,
    lossNote:
      "Badger の集計で約1.16億ドル、報道では約1.2億〜1.3億ドル。1人の被害者から約900 byvWBTC（5,000万ドル超）が奪われた。",
    recovered:
      "Vault から引き出される前だった約900万ドルは回収可能とされた。残りは DAO の資金で段階的に補償した。",
    summary:
      "Cloudflare の API キーを悪用してサイトにスクリプトを注入し、利用者に無制限の approve をさせた。",
    mechanism:
      "攻撃者は、メール認証を済ませなくてもアカウント作成と API キーの発行ができた Cloudflare の不具合を使い、Badger の Cloudflare 環境に無断で API キーを作った。11月10日以降、Cloudflare Workers 経由で app.badger.com に悪意あるスクリプトを断続的に差し込み、正規の預け入れや報酬の受け取りに紛れて、攻撃者のアドレスへの無制限の approve に署名させた。スクリプトは残高の多いウォレットだけを狙い、開発チームの署名者は対象から外していた。十分な承認が集まった12月2日、transferFrom() で一斉に引き抜いた。",
    rootCause:
      "コントラクトではなく、フロントエンドの配信基盤（CDN のアカウントと API キー）が侵害された。",
    aftermath:
      "攻撃者は特定されていない。Badger は Vault を停止し、Mandiant や Chainalysis と調査した。",
    lesson:
      "CDN やホスティングの API キーを最小権限・監査ログ・配信物の改ざん監視で守り、ウォレット側でも見知らぬアドレスへの無制限 approve を警告する。",
    sources: [
      {
        label: "CoinDesk: BadgerDAO Reveals Details of How It Was Hacked",
        url: "https://www.coindesk.com/business/2021/12/10/badgerdao-reveals-details-of-how-it-was-hacked-for-120m",
      },
      { label: "rekt: Badger", url: "https://rekt.news/badger-rekt/" },
    ],
  },
  {
    id: "cream",
    name: "Cream Finance",
    date: "2021-10-27",
    chain: "Ethereum",
    target: "defi",
    category: "economic",
    lossUsdM: 130,
    lossNote: "Cream の発表で約1.3億ドル。約1.17億〜1.36億ドルとする資料もある。",
    recovered: "Yearn が約940万ドルを回収した。攻撃者は報奨金の提案に応じなかった。",
    summary: "担保トークンの価格を、直接送金で動かせる Vault の残高比率から計算していた。",
    mechanism:
      "Cream は Yearn の yUSD Vault トークンを担保として受け入れ、その価格を「Vault が持つ yCrv の残高 ÷ yUSD の総供給量」で計算していた。攻撃者は MakerDAO と Aave から巨額のフラッシュローンを借り、2つのアドレス間で預け入れと借り入れを繰り返して大量の担保を積み上げた。次に Vault から大半を引き出して総供給量を減らし、Vault に yCrv を直接送金して1口あたりの価格を約2倍にした。膨らんだ担保評価で、Cream の貸し出せる資産をほぼすべて借り出した。",
    rootCause: "担保の価格を、寄付（直接送金）で操作できる残高比率から計算していた。",
    aftermath:
      "Cream にとって2021年で3回目の大規模な被害だった。Ethereum の v1 市場は停止された。",
    lesson: "担保の価格を、外部から送金するだけで動く残高比率から計算しない。",
    sources: [
      { label: "rekt: Cream Finance (Oct 2021)", url: "https://rekt.news/cream-rekt-2" },
      {
        label: "Halborn: Explained: The Cream Finance Hack (October 2021)",
        url: "https://www.halborn.com/blog/post/explained-the-cream-finance-hack-october-2021",
      },
    ],
  },
  {
    id: "beanstalk",
    name: "Beanstalk",
    date: "2022-04-17",
    chain: "Ethereum",
    target: "defi",
    category: "economic",
    lossUsdM: 182,
    lossNote:
      "プロトコルから約1.82億ドルが引き抜かれ、その大半はフラッシュローンの返済に回った。攻撃者の手元に残ったのは約7,600万〜8,000万ドル（約24,830 ETH）。",
    recovered: "返還はない。Fertilizer トークンの販売で再資本化した。",
    summary: "フラッシュローンで議決権の約8割を一時的に握り、資金を移す提案を即時実行した。",
    mechanism:
      "Beanstalk では Silo への預け入れ額がそのまま議決権になり、提案から1日経てば、3分の2超の賛成で emergencyCommit() による即時実行ができた。攻撃者は前日に、全資産を自分に送るコードを含む提案（BIP-18）を出しておいた。当日、Aave などから約10億ドルのフラッシュローンを借りて Curve の LP トークンに換え、Silo に預けて議決権の約8割を得た。同じトランザクションの中で投票と emergencyCommit() を実行し、引き抜いた資産でフラッシュローンを返済した。",
    rootCause: "議決権を投票時点の預け入れ額で即座に数え、緊急実行にタイムロックもなかった。",
    aftermath:
      "攻撃者は特定されていない。Beanstalk はオンチェーンガバナンスをやめてマルチシグによる管理に移り、監査を経て2022年8月に再開した。",
    lesson:
      "議決権は提案前のスナップショットで数え、可決から実行まで時間を置いて、借りた議決権で即時実行できないようにする。",
    sources: [
      {
        label: "Beanstalk: Beanstalk Governance Exploit",
        url: "https://bean.money/blog/beanstalk-governance-exploit",
      },
      { label: "rekt: Beanstalk", url: "https://rekt.news/beanstalk-rekt/" },
      {
        label: "CertiK: Revisiting Beanstalk Farms Exploit",
        url: "https://www.certik.com/blog/revisiting-beanstalk-farms-exploit",
      },
    ],
  },
  {
    id: "mango",
    name: "Mango Markets",
    date: "2022-10-11",
    chain: "Solana",
    target: "defi",
    category: "economic",
    lossUsdM: 110,
    lossNote: "米司法省は約1.1億ドル、報道では約1.14億〜1.17億ドル。",
    recovered:
      "攻撃者が提案した「返還する代わりに訴追を求めない」案が DAO の投票で可決され、約6,700万ドルが戻った。約4,700万ドルは「報奨金」として攻撃者の手元に残った。",
    attribution: "Avraham Eisenberg（本人が公表）",
    summary: "流動性の薄い MNGO の現物価格をつり上げ、含み益を担保に借り出した。",
    mechanism:
      "Mango は MNGO 無期限先物の損益と担保価値を、複数の取引所の MNGO 現物価格にもとづくオラクル価格で評価し、未実現の利益を担保に借り入れができた。Avraham Eisenberg は約500万 USDC を2つの口座に入れ、自分同士で約4.83億 MNGO 分の先物のロングとショートを持った。次にオラクルの参照元である流動性の薄い現物市場で MNGO を買い上げ、オラクル価格を約30分で13倍以上にした。膨らんだロングの含み益を担保に1億ドル超の各種資産を借り出し、価格が戻った後には返済できない口座だけが残った。",
    rootCause:
      "流動性の薄いトークンの価格をそのまま担保評価に使い、含み益を担保にした借り入れに上限がなかった。",
    aftermath:
      "Eisenberg は2024年4月に詐欺と相場操縦で有罪評決を受けたが、2025年5月に連邦地裁がこれを覆した（商品関連の2訴因は裁判地の立証不足で取り消し、電信詐欺は無罪）。検察が控訴している。Mango DAO は2025年1月に運営を終えた。",
    lesson:
      "流動性の薄い資産には厳しい担保掛け目と借入上限を設け、価格が急変したときは借り入れを止める。",
    sources: [
      {
        label: "U.S. v. Eisenberg, Opinion and Order (S.D.N.Y., 2025-05-23)",
        url: "https://nysd.uscourts.gov/sites/default/files/2025-05/23cr10%20Opinion%20and%20Order.pdf",
      },
      {
        label: "TRM Labs: Federal judge overturns convictions in Mango Markets case",
        url: "https://www.trmlabs.com/resources/blog/breaking-federal-judge-overturns-all-criminal-convictions-in-mango-markets-case-against-avraham-eisenberg",
      },
      { label: "rekt: Mango Markets", url: "https://rekt.news/mango-markets-rekt/" },
    ],
  },
  {
    id: "euler",
    name: "Euler Finance",
    date: "2023-03-13",
    chain: "Ethereum",
    target: "defi",
    category: "logic",
    lossUsdM: 197,
    lossNote: "DAI、WBTC、stETH、USDC の4つの市場から流出した。",
    recovered: "交渉の末、攻撃者は約3週間で全額を返還した（返還時の評価で約2.4億ドル）。",
    summary: "担保だけを減らせる寄付関数に健全性チェックがなく、自己清算で利益を得た。",
    mechanism:
      "Euler では担保を eToken、負債を dToken で表し、mint() で自己借入によるレバレッジを組めた。2022年7月のアップグレード（eIP-14）で追加された donateToReserves() は、自分の eToken を準備金に寄付して担保だけを減らせるのに、他の関数にある健全性チェック checkLiquidity() を呼んでいなかった。攻撃者はフラッシュローンでレバレッジをかけたポジションを作り、寄付で自らを債務超過にしてから、別のアドレスで清算した。債務超過が深いほど清算の割引が大きくなる仕様のため、清算する側は担保を割安に引き取れた。",
    rootCause:
      "担保を減らす関数に健全性チェックがなく、自分で作った債務超過のポジションを自分で清算できた。",
    aftermath:
      "攻撃者は全額を返還し、訴追は報じられていない。eIP-14 を監査していた Sherlock は450万ドルを補償として支払った。Euler は v1 を閉じ、2024年9月に v2 を公開した。",
    lesson:
      "担保や残高を変えるすべての関数で事後の健全性を検査し、後から追加した関数は清算ロジックとの組み合わせまで含めて再検証する。",
    sources: [
      {
        label: "Euler: War & Peace: Behind the Scenes of Euler's $240M Exploit Recovery",
        url: "https://www.euler.finance/blog/war-peace-behind-the-scenes-of-eulers-240m-exploit-recovery",
      },
      {
        label: "CertiK: Euler Finance Incident Analysis",
        url: "https://www.certik.com/blog/euler-finance-incident-analysis",
      },
      { label: "rekt: Euler", url: "https://rekt.news/euler-rekt/" },
    ],
  },
  {
    id: "curve-vyper",
    name: "Curve（Vyper）",
    date: "2023-07-30",
    chain: "Ethereum",
    target: "defi",
    category: "reentrancy",
    lossUsdM: 70,
    lossNote:
      "集計範囲により約6,200万〜7,350万ドル。JPEG'd、Metronome、Alchemix、Curve の CRV/ETH の4つのプールが被害を受けた。",
    recovered:
      "約5,200万ドル（約73%）が、ホワイトハットや報奨金に応じた攻撃者から返還された。",
    summary: "コンパイラのバグで再入ロックが効かず、ETH を含むプールが抜き取られた。",
    mechanism:
      "Vyper 0.2.15、0.2.16、0.3.0 では、@nonreentrant に同じキーを指定した関数同士でロック用のストレージが共有されず、関数をまたぐ再入を防げなかった（CVE-2023-39363）。これらのバージョンでコンパイルされ、ネイティブ ETH を含む Curve のプールでは、remove_liquidity() が ETH を送った時点で LP トークンの burn がまだ済んでいなかった。攻撃者は ETH を受け取った fallback から add_liquidity() に再入し、残高と LP の総供給量が食い違った状態で LP を過大に発行させ、プールを抜き取った。",
    rootCause:
      "コンパイラのバグで再入ロックが無効になり、さらにプールが状態を更新する前に ETH を送っていた。",
    aftermath:
      "Curve などは10%の報奨金で返還を呼びかけ、一部が応じた。CRV/ETH プールの攻撃者は返還せず、Curve は情報提供に185万ドルの懸賞金をかけた。",
    lesson:
      "再入ロックのような言語機能だけに頼らず、状態の更新を先に行う。使っているコンパイラの既知の脆弱性を追い続ける。",
    sources: [
      {
        label: "Vyper: Vyper Nonreentrancy Lock Vulnerability Technical Post-Mortem",
        url: "https://hackmd.io/@vyperlang/HJUgNMhs2",
      },
      { label: "LlamaRisk: Curve Pool Reentrancy Exploit Post-Mortem", url: "https://hackmd.io/@LlamaRisk/BJzSKHNjn" },
      {
        label: "Chainalysis: Curve Finance Liquidity Pool Hack",
        url: "https://www.chainalysis.com/blog/curve-finance-liquidity-pool-hack/",
      },
    ],
  },
  {
    id: "kyberswap",
    name: "KyberSwap Elastic",
    date: "2023-11-22",
    chain: "Arbitrum ほか",
    target: "defi",
    category: "math",
    lossUsdM: 48.8,
    lossNote:
      "主犯の取得は約4,870万ドル。便乗したフロントランボットの分を含めると約5,500万ドル。Arbitrum、Optimism、Ethereum、Polygon、Base、Avalanche の6チェーン。",
    recovered: "フロントランボットの運営者2者が約500万ドルを返還した。主犯は返還していない。",
    attribution: "Andean Medjedovic（米司法省が起訴）",
    summary: "丸め方向の誤りで、tick を越えても流動性が更新されない状態を作られた。",
    mechanism:
      "集中流動性 AMM の KyberSwap Elastic は、スワップが次の tick 境界に届くかを見積もり、届かなければ tick をまたぐ処理（流動性の更新）を行わない。estimateIncrementalLiquidity() は切り上げるべき値を切り捨てていたため、交換量を「境界に届く量の1つ手前」に調整すると、tick をまたがない分岐に入りながら価格だけが境界を越えた。攻撃者はフラッシュローンで価格を他の流動性がない範囲に動かして自分の流動性を置き、この細工したスワップの後に逆方向へスワップした。境界を戻るときに流動性が二重に数えられ、支払った以上のトークンを受け取った。",
    rootCause: "tick をまたぐかの判定と最終価格の計算が、丸め方向の誤りで食い違った。",
    aftermath:
      "攻撃者はプロトコルの支配権を要求したが、Kyber は拒否した。米司法省は2025年2月にカナダ国籍の Andean Medjedovic を起訴したが、逃亡中とされる。",
    lesson:
      "価格と流動性の計算では丸め方向をすべてプロトコル有利に揃え、「tick をまたがないなら価格は境界を越えない」といった不変条件をファジングで検証する。",
    sources: [
      {
        label: "KyberSwap: Post Mortem: KyberSwap Elastic Exploit",
        url: "https://blog.kyberswap.com/post-mortem-kyberswap-elastic-exploit/",
      },
      {
        label: "BlockSec: KyberSwap Incident: Masterful Exploitation of Rounding Errors",
        url: "https://blocksec.com/blog/kyberswap-incident-masterful-exploitation-of-rounding-errors-with-exceedingly-subtle-calculations",
      },
      {
        label: "U.S. DOJ (EDNY): Canadian National Charged with Stealing Approximately $65 Million",
        url: "https://www.justice.gov/usao-edny/pr/canadian-national-charged-stealing-approximately-65-million-cryptocurrency-two-defi",
      },
    ],
  },
  {
    id: "poly-network",
    name: "Poly Network",
    date: "2021-08-10",
    chain: "Ethereum ほか",
    target: "bridge",
    category: "logic",
    lossUsdM: 611,
    lossNote: "Ethereum 約2.73億ドル、BNB Chain 約2.53億ドル、Polygon 約8,500万ドル。",
    recovered:
      "攻撃者は交渉に応じ、約2週間でほぼ全額を返した。Tether が凍結した約3,300万 USDT も戻った。",
    attribution: "不明（攻撃者は「ホワイトハット」を自称）",
    summary:
      "メッセージを実行するコントラクトに管理者権限があり、関数セレクタの衝突で署名者を差し替えられた。",
    mechanism:
      "Ethereum 側では、署名者（keeper）の公開鍵を保持する EthCrossChainData の owner が、任意のクロスチェーンメッセージを実行する EthCrossChainManager になっていた。EthCrossChainManager は、メッセージで指定された関数名から bytes4(keccak256(_method + \"(bytes,bytes,uint64)\")) を計算して宛先を呼び出す。攻撃者は、このセレクタが putCurEpochConPubKeyBytes(bytes) と一致する関数名を総当たりで見つけ、宛先を EthCrossChainData とするメッセージを送った。呼び出し元が owner なので onlyOwner を通過し、keeper が攻撃者の鍵に置き換わった。以後は自分で署名したメッセージで、各チェーンの資産を引き出した。",
    rootCause:
      "任意の呼び出しを行うコントラクトに、署名者を管理するコントラクトの owner 権限を持たせていた。",
    aftermath:
      "Poly Network は法的責任を問わないとし、50万ドルの報奨金とセキュリティ顧問の職を提示した。",
    lesson:
      "任意の宛先と関数を呼べる経路からは、特権を持つコントラクトに到達できないよう権限を分ける。",
    sources: [
      {
        label: "BlockSec: The Further Analysis of the Poly Network Attack",
        url: "https://blocksec.com/blog/the-further-analysis-of-the-poly-network-attack",
      },
      {
        label: "Kudelski Security: The Poly Network Hack Explained",
        url: "https://research.kudelskisecurity.com/2021/08/12/the-poly-network-hack-explained/",
      },
      {
        label: "CNBC: Poly Network hacker returns remaining cryptocurrency",
        url: "https://www.cnbc.com/2021/08/23/poly-network-hacker-returns-remaining-cryptocurrency.html",
      },
    ],
  },
  {
    id: "wormhole",
    name: "Wormhole",
    date: "2022-02-02",
    chain: "Solana・Ethereum",
    target: "bridge",
    category: "logic",
    lossUsdM: 326,
    lossNote: "120,000 wETH。",
    recovered:
      "攻撃者からの返還はない。Jump Crypto が翌日までに 120,000 ETH を補填した。2023年2月には裁判所の命令にもとづき、攻撃者の Oasis の vault から約2.25億ドル相当を回収した。",
    summary: "署名検証の手前で偽の sysvar アカウントを渡され、検証済みの扱いにされた。",
    mechanism:
      "Solana 側の verify_signatures は、同じトランザクションの中で Secp256k1 プログラムによる guardian 署名の検証が行われたことを、Instructions sysvar アカウントを読んで確かめていた。しかし非推奨の API を使っていたため、渡されたアカウントが本物の sysvar かどうかを確認していなかった。攻撃者は偽のデータを入れたアカウントを渡して verify_signatures を通し、すべての guardian 署名が検証済みとされた SignatureSet を作った。これを使って「120,000 wETH を発行せよ」という偽のメッセージ（VAA）を通し、裏付けのない wETH を発行した。",
    rootCause:
      "入力アカウントのアドレスを検証しない非推奨の API に依存し、署名検証そのものを偽のアカウントで迂回できた。",
    aftermath:
      "Wormhole は1,000万ドルの報奨金を提示したが、攻撃者は応じなかった。修正のコミットは攻撃の前に公開リポジトリに上がっていたが、まだデプロイされていなかった。",
    lesson:
      "Solana のプログラムでは sysvar を含むすべての入力アカウントのアドレスと owner を検証し、脆弱性の修正は公開とデプロイの間に時間差を作らない。",
    sources: [
      {
        label: "Wormhole: Wormhole Incident Report 02/02/22",
        url: "https://wormholecrypto.medium.com/wormhole-incident-report-02-02-22-ad9b8f21eec6",
      },
      {
        label: "CertiK: Wormhole Bridge Exploit Incident Analysis",
        url: "https://www.certik.com/blog/wormhole-bridge-exploit-incident-analysis",
      },
      {
        label: "Halborn: Explained: The Wormhole Hack (February 2022)",
        url: "https://www.halborn.com/blog/post/explained-the-wormhole-hack-february-2022",
      },
    ],
  },
  {
    id: "ronin",
    name: "Ronin Bridge",
    date: "2022-03-23",
    chain: "Ronin・Ethereum",
    target: "bridge",
    category: "key",
    lossUsdM: 624,
    lossNote: "173,600 ETH と 2,550万 USDC。評価時点により約5.4億〜6.25億ドル。",
    recovered:
      "FBI と Chainalysis が2022年9月に約3,000万ドルを押収し、ノルウェーの当局も約590万ドルを押収した。利用者の分は Sky Mavis の自己資金と Binance などの支援で補填した。",
    attribution: "Lazarus Group（北朝鮮。FBI が2022年4月に特定）",
    summary: "9つのバリデータ鍵のうち5つを奪われ、偽の出金が承認された。発覚まで6日かかった。",
    mechanism:
      "Ronin ブリッジの出金は9つのバリデータのうち5つの署名で承認され、そのうち4つを Sky Mavis 自身が運用していた。2021年11月、Sky Mavis は負荷対策として Axie DAO のバリデータに代わって署名する許可を得たが、12月に運用をやめた後も権限を取り消していなかった。攻撃者は偽の求人で Sky Mavis のエンジニアに接触し、オファーと称する PDF でマルウェアに感染させて社内に侵入し、4つの鍵を掌握した。残っていた委任権限で Axie DAO 側の署名も得て、2件の偽の出金で ETH と USDC を引き出した。大口の流出を検知する監視が働かず、6日後に利用者が出金できないと報告して初めて発覚した。",
    rootCause:
      "低い閾値の鍵の大半を一社が持ち、失効し忘れた委任権限で残りの署名も同じ経路から得られた。",
    aftermath:
      "Sky Mavis は利用者の損失を補填し、バリデータの増員、大口出金への追加承認、日次の上限を入れた新しいブリッジを2022年6月に再開した。",
    lesson:
      "署名鍵を独立した組織に分散して閾値を上げ、一時的な委任は期限付きにし、ブリッジ残高の大きな変動を常時監視する。",
    sources: [
      {
        label: "FBI: Statement on Attribution of Malicious Cyber Activity Posed by the DPRK",
        url: "https://www.fbi.gov/news/press-releases/fbi-statement-on-attribution-of-malicious-cyber-activity-posed-by-the-democratic-peoples-republic-of-korea",
      },
      {
        label: "The Hacker News: Hackers Used Fake Job Offer to Hack and Steal $540 Million",
        url: "https://thehackernews.com/2022/07/hackers-used-fake-job-offer-to-hack-and.html",
      },
      {
        label: "The Block: Chainalysis and U.S. law enforcement recover $30 million",
        url: "https://www.theblock.co/post/168663/chainalysis-and-us-law-enforcement-recover-30-million-from-north-korea-linked-ronin-exploit",
      },
    ],
  },
  {
    id: "harmony",
    name: "Harmony Horizon Bridge",
    date: "2022-06-23",
    chain: "Ethereum・BNB Chain",
    target: "bridge",
    category: "key",
    lossUsdM: 100,
    lossNote: "ETH、USDT、USDC、DAI、BNB など14種類の資産。",
    recovered: "一部は取引所で凍結されたが、総額は公表されていない。",
    attribution: "Lazarus Group（北朝鮮。FBI が2023年1月に特定）",
    summary: "2-of-5 のマルチシグのうち2つの鍵を奪われ、ブリッジの資産を送金された。",
    mechanism:
      "Horizon ブリッジの Ethereum と BNB Chain 側の資産は、5人の owner のうち2人の承認で送金できるマルチシグで管理されていた。Harmony によれば鍵はパスフレーズと KMS で二重に暗号化されていたが、攻撃者は複数の鍵にアクセスして復号した。2つの owner を握った攻撃者は、マルチシグの承認関数を直接呼び出して資産を送金し、DEX で ETH に換えて Tornado Cash などで洗浄した。",
    rootCause: "2-of-5 という低い閾値の鍵を、同じ組織の同じ基盤で運用していた。",
    aftermath:
      "Harmony は ONE トークンを新たに発行して補填する案を出したが、批判を受けて撤回した。",
    lesson:
      "大きな資産を守る署名は閾値を高くし、鍵を異なる組織と環境に分けて、一つの基盤が侵害されても閾値に届かない構成にする。",
    sources: [
      {
        label: "Elliptic: Harmony's Horizon Bridge becomes latest victim in $100 million hack",
        url: "https://www.elliptic.co/insights/over-1-billion-stolen-from-bridges-so-far-in-2022-as-harmony-s-horizon-bridge-becomes-latest-victim-in-100-million-hack/",
      },
      {
        label: "The Record: FBI says North Korean hacking group Lazarus behind $100 million crypto heist",
        url: "https://therecord.media/fbi-north-korean-hacking-group-lazarus-behind-100-million-crypto-heist",
      },
    ],
  },
  {
    id: "nomad",
    name: "Nomad Bridge",
    date: "2022-08-01",
    chain: "Ethereum",
    target: "bridge",
    category: "logic",
    lossUsdM: 190,
    recovered: "10%の報奨金と免責を条件に返還を呼びかけ、約3,300万ドルが戻った。",
    attribution:
      "数百のアドレスが便乗した。米司法省は2023年に最初期の攻撃者の一人とされる Alexander Gurevich を起訴した。",
    summary: "初期化で 0x00 を信頼済みのルートにしてしまい、証明のないメッセージが通るようになった。",
    mechanism:
      "Replica コントラクトの process() は、メッセージのハッシュに対応する Merkle ルートが受理済みかを acceptableRoot(messages[hash]) で確かめていた。2022年6月21日のアップグレードで initialize() に _committedRoot = 0x00 が渡され、confirmAt[0x00] = 1、つまり 0x00 が受理済みのルートになった。一度も証明されていないメッセージの messages[hash] は既定値の 0x00 なので、証明なしで process() を呼ぶだけで任意のメッセージが通った。最初の攻撃トランザクションの受取アドレスを書き換えて送り直すだけで誰でも同じことができたため、数百のアドレスによる「群衆略奪」で、数時間のうちにほぼ全額が流出した。",
    rootCause:
      "アップグレード時の初期化で 0x00 を信頼済みのルートとして登録し、未証明のメッセージの既定値と一致してしまった。",
    aftermath:
      "Nomad は返還した人をホワイトハットとして扱うと表明した。Gurevich は2025年5月にイスラエルで身柄を拘束された。",
    lesson:
      "初期化とアップグレードのパラメータをデプロイ後の検査で確かめ、bytes32(0) を信頼値として受け付けないようコードで禁止する。",
    sources: [
      {
        label: "Immunefi: Hack Analysis: Nomad Bridge, August 2022",
        url: "https://immunefi.com/blog/bug-fix-reviews/hack-analysis-nomad-bridge-august-2022/",
      },
      {
        label: "CertiK: Nomad Bridge Exploit Incident Analysis",
        url: "https://www.certik.com/blog/nomad-bridge-exploit-incident-analysis",
      },
      {
        label: "TRM Labs: Key suspect in $190M Nomad Bridge exploit extradited",
        url: "https://www.trmlabs.com/resources/blog/key-suspect-in-190m-nomad-bridge-exploit-extradited-to-the-united-states",
      },
    ],
  },
  {
    id: "bnb-bridge",
    name: "BNB Bridge",
    date: "2022-10-06",
    chain: "BNB Chain",
    target: "bridge",
    category: "logic",
    lossUsdM: 570,
    lossNote:
      "不正に発行された200万 BNB の評価額。実際に BNB Chain の外へ持ち出されたのは約1億〜1.27億ドルで、残りはチェーンの停止で動かせなくなった。",
    recovered:
      "BNB Chain はバリデータと連携してチェーンを止め、攻撃者のアドレスを封じた。Tether と Circle は計約3,350万ドルを凍結した。",
    summary: "Merkle 証明を検証するライブラリのバグで、偽の証明から200万 BNB を発行された。",
    mechanism:
      "BNB Chain のブリッジは、Beacon Chain からのパッケージを受け付けるとき、Cosmos 由来の IAVL ライブラリで Merkle 証明を検証していた。このライブラリは、証明の経路上のノードが左の子を持つ場合に右側のハッシュをルートの計算に使っておらず、そこに任意の値を入れてもルートが変わらなかった。攻撃者は過去に受理された正規の証明を流用し、「攻撃者に100万 BNB を送る」という偽の葉を加えても同じルートになる証明を作った。これを2回通して計200万 BNB を受け取り、一部を Venus に担保として預けてステーブルコインを借り、他のチェーンへ移した。",
    rootCause:
      "証明検証のライブラリが証明の一部をルートの計算に使っておらず、偽の葉を含む証明を正しいと判定した。",
    aftermath:
      "同じライブラリを使う他のプロジェクトにも影響し、Cosmos 側が緊急の修正を出した。攻撃者は特定されていない。",
    lesson:
      "ブリッジの証明検証は外部ライブラリを鵜呑みにせず証明の構造まで厳密に確かめ、出金のレート制限と異常検知を併せて置く。",
    sources: [
      {
        label: "Elliptic: Attack Mints $569 Million Worth of BNB Tokens in BSC Bridge Exploit",
        url: "https://www.elliptic.co/blog/analysis/attack-mints-569-million-worth-of-bnb-tokens-in-bsc-bridge-exploit",
      },
      {
        label: "Coinbase: BSC Token Hub Compromise Investigation and Analysis",
        url: "https://www.coinbase.com/blog/bsc-token-hub-compromise-investigation-and-analysis-8",
      },
      {
        label: "QuillAudits: BSC Token Hub Bridge Hack Analysis",
        url: "https://www.quillaudits.com/blog/hack-analysis/bsc-token-hub-bridge-hack",
      },
    ],
  },
  {
    id: "multichain",
    name: "Multichain",
    date: "2023-07-06",
    chain: "Fantom ほか",
    target: "bridge",
    category: "key",
    lossUsdM: 126,
    lossNote: "約1.25億〜1.3億ドル。",
    recovered: "Circle と Tether が約6,500万ドルを凍結した。",
    attribution: "不明（外部からの攻撃か内部者かも判明していない）",
    summary: "鍵を管理するインフラが CEO 個人に集中しており、CEO の拘束後に資金が流出した。",
    mechanism:
      "Multichain は各チェーンにロックした資産を MPC（鍵を分割して共同で署名する方式）のアドレスで管理していたが、MPC ノードを動かすサーバーは CEO 個人のクラウドアカウントにあり、実質的に CEO 一人が管理していた。2023年5月に CEO が中国の警察に連行されると、チームはインフラにアクセスできなくなった。7月6日、Fantom などのブリッジの MPC アドレスから、有効な署名で約1.26億ドルが未知のアドレスへ送られた。コントラクトのバグではなく、署名の権限そのものが使われた。",
    rootCause: "分散しているはずの署名インフラと運用の権限が、CEO 個人に集中していた。",
    aftermath: "Multichain は2023年7月14日に運営の停止を発表した。",
    lesson:
      "MPC やマルチシグの鍵の断片と、それを動かすインフラを複数の組織と個人に分け、特定の人が欠けても運用を続けられるようにする。",
    sources: [
      {
        label: "Chainalysis: Multichain Exploit",
        url: "https://www.chainalysis.com/blog/multichain-exploit-july-2023/",
      },
      {
        label: "The Block: Multichain ceases operations as CEO's sister is detained",
        url: "https://www.theblock.co/news/ecosystems/2023-07-14-multichain-ceases-operations-as-ceos-sister-is-detained-in-china-while-holding-220-million-of-funds-239589",
      },
    ],
  },
  {
    id: "orbit",
    name: "Orbit Bridge",
    date: "2023-12-31",
    chain: "Ethereum",
    target: "bridge",
    category: "key",
    lossUsdM: 81.5,
    lossNote:
      "9,500 ETH、231 WBTC、3,000万 USDT、1,000万 USDC、1,000万 DAI。韓国時間では2024年1月1日の事件。",
    recovered: "回収は確認されていない。",
    attribution: "未確定（手口の類似から Lazarus Group の関与が指摘されている）",
    summary: "ブリッジの署名者10人のうち7人分の署名で、不正な出金が承認された。",
    mechanism:
      "Orbit Bridge の Ethereum 側の vault は、署名者の署名を集めて出金するマルチシグで、オンチェーンの分析では10人中7人分の署名で不正な出金が承認された。攻撃者は約30分の間に数件の出金で ETH、WBTC、ステーブルコインを引き出した。運営の Ozys は、コントラクトの欠陥でも鍵の窃取でもなく、退職予定だった元 CISO が社内のファイアウォールの設定を弱めたことが侵入を許したと主張しているが、侵入の経路は公表されていない。",
    rootCause:
      "出金の署名を担う運営側のインフラが侵害され、閾値を満たす署名が攻撃者の出金に付けられた。",
    aftermath: "Ozys は韓国の当局に届け出て、元 CISO を提訴した。公的な犯人の特定はされていない。",
    lesson: "署名鍵を独立した組織とネットワークに分け、防御設定の変更を複数人の承認と監査ログで管理する。",
    sources: [
      { label: "rekt: Orbit Bridge", url: "https://rekt.news/orbit-bridge-rekt" },
      {
        label: "The Block: Orbit Bridge blames firewall sabotage",
        url: "https://www.theblock.co/post/274411/orbit-bridge-firewall-sabotage-exploit",
      },
    ],
  },
  {
    id: "dmm-bitcoin",
    name: "DMM Bitcoin",
    date: "2024-05-31",
    chain: "Bitcoin",
    target: "cex",
    category: "key",
    lossUsdM: 308,
    lossNote: "4,502.9 BTC（約482億円）。",
    recovered:
      "盗まれた BTC は回収されていない。DMM Bitcoin はグループ会社の支援で550億円を調達し、顧客の預かり BTC を全額保証した。",
    attribution: "TraderTraitor（北朝鮮。警察庁・FBI などが2024年12月に特定）",
    summary: "委託先の従業員が偽の採用試験で侵害され、正規の送金リクエストを改ざんされた。",
    mechanism:
      "2024年3月下旬、攻撃者は LinkedIn でリクルーターを装い、DMM Bitcoin のウォレット管理を受託していた Ginco の従業員に接触し、採用前の試験と称して悪意ある Python スクリプトの URL を送った。従業員の端末が侵害され、攻撃者は5月中旬以降、盗んだセッションクッキーでこの従業員になりすまし、Ginco の通信システムに入り込んだ。5月下旬、攻撃者は DMM の従業員による正規の取引リクエストを改ざんし、4,502.9 BTC を攻撃者のウォレットへ送らせた。",
    rootCause:
      "委託先の従業員がソーシャルエンジニアリングで侵害され、改ざんされた送金内容を独立に検証する仕組みがなかった。",
    aftermath:
      "関東財務局が業務改善命令を出し、DMM Bitcoin は2024年12月に廃業を発表、2025年3月に約60万口座を SBI VCトレードへ移した。警察庁は、TraderTraitor による国内の被害を初めて確認した事例としている。",
    lesson:
      "送金先と金額を、委託先のシステムとは独立した経路（別端末での照合、送金先の許可リスト、複数人の承認）で確かめ、委託先の開発者端末まで防御の対象に含める。",
    sources: [
      {
        label: "警察庁: 北朝鮮を背景とするサイバー攻撃グループ TraderTraitor による暗号資産関連事業者を標的としたサイバー攻撃について",
        url: "https://www.npa.go.jp/bureau/cyber/pdf/20241224_jp.pdf",
      },
      {
        label: "FBI: FBI, DC3, and NPA Identification of North Korean Cyber Actors Tracked as TraderTraitor",
        url: "https://www.fbi.gov/news/press-releases/fbi-dc3-and-npa-identification-of-north-korean-cyber-actors-tracked-as-tradertraitor-responsible-for-theft-of-308-million-from-bitcoindmmcom",
      },
      {
        label: "ITmedia: 「DMMビットコイン」廃業へ　口座などはSBI VCトレードに移管",
        url: "https://www.itmedia.co.jp/news/articles/2412/02/news093.html",
      },
    ],
  },
  {
    id: "wazirx",
    name: "WazirX",
    date: "2024-07-18",
    chain: "Ethereum",
    target: "cex",
    category: "key",
    lossUsdM: 235,
    lossNote: "約2.3億〜2.35億ドル。",
    recovered:
      "回収は限られている。運営会社の再建計画が2025年10月にシンガポールの裁判所で認められ、利用者に保有額の約85%を分配して取引を再開した。",
    attribution: "北朝鮮（2025年1月の日米韓共同声明で米国と韓国が帰属）",
    summary:
      "第三者のカストディの画面で正常な送金に見えたトランザクションが、ウォレットの実装の差し替えだった。",
    mechanism:
      "被害を受けたウォレットは Safe の 4-of-6 マルチシグで、WazirX の署名者5人（Ledger）と Liminal の1人（HSM）で構成されていた。WazirX の3人が Liminal の画面で内容を確かめて署名し、Liminal がポリシーを確認して最後の署名を加える運用だった。署名者は画面に表示された USDT と GALA の送金を信じて署名したが、Ledger は送金先やトークンを表示しないブラインド署名で、実際の署名対象は Safe の実装を攻撃者のコントラクトに差し替える delegatecall だった。差し替えの後、攻撃者は追加の署名なしでウォレットの資産を引き出した。",
    rootCause:
      "署名者が第三者の画面表示とブラインド署名に頼り、表示と実際の中身の違いを検出できなかった。",
    aftermath:
      "WazirX は Liminal 側の侵害を、Liminal は WazirX の署名者端末の侵害を主張し、侵入点は争われている。損失を利用者全体で按分した再建計画をめぐり、インドで訴訟も起きている。",
    lesson:
      "operation が delegatecall のトランザクションや実装の変更は、独立したツールでデコードして原則拒否し、ハードウェアウォレットで中身を表示して署名する。",
    sources: [
      {
        label: "WazirX: Preliminary Report: Cyber Attack on WazirX Multisig Wallet",
        url: "https://wazirx.com/blog/preliminary-report-cyber-attack-on-wazirx-multisig-wallet/",
      },
      { label: "Cobo: WazirX Hack Incident Analysis", url: "https://www.cobo.com/post/wazirx-hack-incident-analysis" },
      {
        label: "CoinDesk: WazirX restructuring cleared",
        url: "https://www.coindesk.com/markets/2025/10/13/wazirx-restructuring-cleared-in-massive-relief-for-usd230m-hack-victims",
      },
    ],
  },
  {
    id: "radiant",
    name: "Radiant Capital",
    date: "2024-10-16",
    chain: "Arbitrum・BNB Chain",
    target: "defi",
    category: "key",
    lossUsdM: 50,
    lossNote: "利用者のウォレットに残っていた approve 経由の被害を含めると約5,800万ドル。",
    recovered: "回収は報告されていない。",
    attribution: "UNC4736（北朝鮮。Mandiant が特定）",
    summary: "開発者の端末がマルウェアに感染し、定例の操作に見せかけてコントラクトの所有権を移された。",
    mechanism:
      "2024年9月、Radiant の開発者が「元契約者」を装う Telegram メッセージで ZIP ファイルを受け取り、PDF に見せかけた macOS のバックドアに感染した。重要な操作は 3-of-11 の Safe マルチシグで行われていた。10月16日、開発者が定例のパラメータ調整に署名すると、マルウェアは Safe{Wallet} の画面に正常な内容を表示したまま、Ledger には別のトランザクションを送った。署名は失敗したように見せかけられて再署名を求められたが、再送は日常的だったため疑われず、攻撃者は3人分の署名を集めた。その署名でプールを管理するコントラクトの所有権を移し、実装を差し替えて資産を引き出した。",
    rootCause:
      "署名者の端末がマルウェアに侵害されて画面と署名内容がすり替えられ、さらに低い閾値で所有権の移転を即時に実行できた。",
    aftermath:
      "Radiant は署名者を7人・閾値を4に変え、コントラクトの更新と所有権の移転に72時間のタイムロックを入れた。",
    lesson:
      "所有権の移転やアップグレードには必ずタイムロックを設け、署名に失敗した後の再署名の要求は異常として、別の端末で calldata を照合する。",
    sources: [
      { label: "Radiant: Radiant Post-Mortem", url: "https://medium.com/@RadiantCapital/radiant-post-mortem-fecd6cd38081" },
      {
        label: "Halborn: Explained: The Radiant Capital Hack (October 2024)",
        url: "https://www.halborn.com/blog/post/explained-the-radiant-capital-hack-october-2024",
      },
      {
        label: "BleepingComputer: Radiant links $50 million crypto heist to North Korean hackers",
        url: "https://www.bleepingcomputer.com/news/security/radiant-links-50-million-crypto-heist-to-north-korean-hackers/",
      },
    ],
  },
  {
    id: "bybit",
    name: "Bybit",
    date: "2025-02-21",
    chain: "Ethereum",
    target: "cex",
    category: "supply-chain",
    lossUsdM: 1460,
    lossNote: "約40.1万 ETH に加え、stETH、mETH、cmETH。FBI は約15億ドルとしている。",
    recovered: "Mantle が約4,300万ドル分の cmETH を回収した。凍結できたのは全体の数%にとどまった。",
    attribution: "TraderTraitor（北朝鮮。FBI が2025年2月26日に特定）",
    summary:
      "Safe{Wallet} が配信する JavaScript が改ざんされ、署名者はウォレットの実装の差し替えに署名した。",
    mechanism:
      "Safe{Wallet} の開発者の端末が侵害され、攻撃者は盗んだ AWS のセッショントークンで Safe のクラウド環境に入り込んだ。2月19日、S3 から配信されるフロントエンドの JavaScript に、Bybit のウォレットからの取引のときだけ動いて内容を差し替えるコードを注入した。2月21日、Bybit の署名者は定例の送金に見える画面で Ledger を使って署名したが、実際の中身は operation=1（delegatecall）で攻撃者のコントラクトを呼ぶものだった。delegatecall でプロキシの実装アドレスが書き換えられ、攻撃者は署名なしで資産を引き出した。実行の約2分後、JavaScript は元に戻された。",
    rootCause:
      "第三者のウォレットUIの配信基盤が侵害され、署名者がブラインド署名で delegatecall による実装の差し替えを承認した。",
    aftermath:
      "単独の事件として暗号資産史上最大の被害額。Bybit は出金を止めず、借り入れと買い付けで約72時間以内に顧客の ETH の不足を埋め、回収額の10%を支払う報奨金制度を作った。攻撃者は約10日で、盗んだ ETH のほぼすべてを THORChain などを通じて換金した。",
    lesson:
      "署名者は to・operation・data・safeTxHash をフロントエンドとは別のツールで確かめ、コールドウォレットの実装の変更は Guard やタイムロックで制限する。",
    sources: [
      {
        label: "FBI/IC3: North Korea Responsible for $1.5 Billion Bybit Hack",
        url: "https://www.ic3.gov/psa/2025/psa250226",
      },
      {
        label: "Sygnia: Sygnia Investigation: Bybit Hack",
        url: "https://www.sygnia.co/blog/sygnia-investigation-bybit-hack/",
      },
      {
        label: "NCC Group: In-Depth Technical Analysis of the Bybit Hack",
        url: "https://www.nccgroup.com/research/in-depth-technical-analysis-of-the-bybit-hack/",
      },
    ],
  },
  {
    id: "cetus",
    name: "Cetus",
    date: "2025-05-22",
    chain: "Sui",
    target: "defi",
    category: "math",
    lossUsdM: 223,
    lossNote: "約2.23億〜2.3億ドル。",
    recovered:
      "約1.62億ドルが Sui のバリデータの緊急措置で凍結され、オンチェーン投票を経て回収された。Ethereum へブリッジされた約6,000万ドルは戻っていない。",
    summary:
      "依存ライブラリのオーバーフロー検査が誤っており、ほぼゼロの預け入れで巨大な流動性を発行された。",
    mechanism:
      "Cetus の集中流動性 AMM は、流動性の追加に必要なトークン量を計算する途中で、共有の数学ライブラリ integer-mate の checked_shlw（u256 を64ビット左シフトする前のオーバーフロー検査）を呼んでいた。checked_shlw は本来 n >= 1 << 192 を拒否すべきところを、n > 0xffffffffffffffff << 192 という誤った条件で判定しており、一部の値を安全とみなしていた。Move では加減乗除のオーバーフローは abort するが、左シフトは上位ビットを黙って切り捨てるため、必要な預け入れ量が極小に化けた。攻撃者はフラッシュスワップで資金を借り、極端に狭い価格帯に巨大な流動性を指定して実質1単位のトークンで流動性を発行し、それを引き出す操作を複数のプールで繰り返した。",
    rootCause:
      "依存ライブラリのオーバーフロー検査が誤った閾値を使っており、左シフトの桁あふれを見逃した。",
    aftermath:
      "凍結資金の回収は、Sui のバリデータによるオンチェーン投票（賛成90.9%）で承認された。Cetus は6月に再開し、LP に損失の大半を返した。",
    lesson:
      "「チェック付き」と名の付く算術ヘルパーこそ、境界値テストと形式検証の対象に含める。",
    sources: [
      { label: "rekt: Cetus", url: "https://rekt.news/cetus-rekt" },
      {
        label: "Cyfrin: Inside the $223M Cetus Exploit",
        url: "https://www.cyfrin.io/blog/inside-the-223m-cetus-exploit-root-cause-and-impact-analysis",
      },
      {
        label: "Sui: Cetus Incident Response: Onchain Community Vote",
        url: "https://www.sui.io/blog/cetus-incident-response-onchain-community-vote",
      },
    ],
  },
  {
    id: "gmx",
    name: "GMX V1",
    date: "2025-07-09",
    chain: "Arbitrum",
    target: "defi",
    category: "reentrancy",
    lossUsdM: 42,
    recovered:
      "10%の報奨金の提示に応じ、攻撃者は約4,050万ドルを返還し、約500万ドルを報奨金として受け取った。",
    summary:
      "ETH の送金時のコールバックから再入し、GLP の価格計算に使う平均ショート価格を歪めた。",
    mechanism:
      "GMX V1 の OrderBook.executeDecreaseOrder() は、ポジションを縮小したあと担保を ETH にして送金するが、送金先がコントラクトである場合を想定していなかった。攻撃者は送金を受けたコールバックの中から Vault.increasePosition() を直接呼び、平均ショート価格を記録する ShortsTracker を更新させないまま巨大な BTC のショートを建てた。これを繰り返して BTC の平均ショート価格を約10.9万ドルから約1,900ドルへ歪め、未実現損益を通じて GLP の資産評価（AUM）を膨らませた。フラッシュローンで GLP を発行し、つり上がった価格で償還して資産を引き出した。",
    rootCause:
      "ETH の送金を伴う経路でコントラクトをまたぐ再入を防げず、GLP の評価が一つの取引の中で操作できる指標に連動していた。",
    aftermath:
      "V1 の取引と GLP の発行は停止された。PeckShield によれば、このバグは2022年に別の不具合を修正したときに入り込んだものだった。",
    lesson:
      "再入ガードを一つのコントラクトに閉じず、送金やコールバックを伴うすべての経路で状態更新の順序とコントラクト間の不変条件を確かめる。",
    sources: [
      { label: "rekt: GMX", url: "https://rekt.news/gmx-rekt" },
      {
        label: "BlockSec: GMX Incident: Cross-Contract Reentrancy",
        url: "https://blocksec.com/blog/gmx-incident-cross-contract-reentrancy-bypasses-a-four-year-old-guard",
      },
      {
        label: "CoinDesk: GMX exploiter returns $40M",
        url: "https://www.coindesk.com/markets/2025/07/11/gmx-exploiter-return-usd40m-days-after-hack-token-zooms-higher",
      },
    ],
  },
  {
    id: "swissborg",
    name: "SwissBorg",
    date: "2025-09-08",
    chain: "Solana",
    target: "cex",
    category: "supply-chain",
    lossUsdM: 41.5,
    lossNote: "約19.3万 SOL。権限を移す命令への署名は8月31日、資金の引き出しは9月8日。",
    recovered:
      "SwissBorg は影響を受けた利用者（顧客の約1%）に、自社の資金で全額を補填すると表明した。",
    summary:
      "ステーキング事業者の API が侵害され、通常のアンステーク要求に権限を移す命令が紛れ込んだ。",
    mechanism:
      "SwissBorg の SOL Earn は、ステーキング事業者 Kiln の API を通じて Solana のステーキング操作を行っていた。Kiln の調査によれば、同社のエンジニアの GitHub のアクセストークンが盗まれ、攻撃者は API に悪意あるペイロードを注入した。8月31日、通常のアンステーク要求に見えるトランザクションに、stake account の権限を攻撃者に移す authorize 命令が8つ隠されており、SwissBorg はこれに署名した。9月8日、攻撃者はアンステークと引き出しを実行し、SOL を数分で持ち去った。",
    rootCause: "外部の API が返したトランザクションを、中身を検証せずに署名した。",
    aftermath: "Kiln は予防措置として、運用する Ethereum のバリデータを順次エグジットさせた。",
    lesson: "外部のサービスが組み立てたトランザクションは、命令の種類まで自分でデコードしてから署名する。",
    sources: [
      {
        label: "SwissBorg: Security update on the Kiln breach",
        url: "https://swissborg.com/blog/swissborg-security-update-kiln-breach",
      },
      {
        label: "Halborn: Explained: The SwissBorg Hack (September 2025)",
        url: "https://www.halborn.com/blog/post/explained-the-swissborg-hack-september-2025",
      },
    ],
  },
  {
    id: "balancer",
    name: "Balancer V2",
    date: "2025-11-03",
    chain: "Ethereum ほか",
    target: "defi",
    category: "math",
    lossUsdM: 128,
    lossNote:
      "フォークを含む業界の集計で約1.28億ドル、Balancer の事後報告では約9,480万ドル。Ethereum、Arbitrum、Base など複数のチェーンと、Berachain・Sonic 上のフォークが被害を受けた。",
    recovered:
      "StakeWise による回収やホワイトハットの救出などで、計2,800万〜3,800万ドルほどが確保された。",
    summary: "スケーリング時の丸め誤差を1回のバッチスワップで積み上げ、プールの不変量を歪めた。",
    mechanism:
      "Balancer V2 の Composable Stable Pool では、内部計算のためにトークン量をスケーリングする _upscale() が常に切り捨てており、出力量を指定するスワップでは丸めがプールに不利になる場合があった。rate provider によるスケーリング係数が端数を生み、プールを極端に流動性の低い状態に追い込むと、数 wei の誤差が不変量 D の過小評価につながり、LP トークン（BPT）の価格を押し下げられた。攻撃者は1回の batchSwap の中で65回以上の小さなスワップを行って誤差を積み上げ、割安になった BPT と原資産の差を抜き取った。batchSwap は決済を最後にまとめて行うため、一時的に BPT を借りた状態で操作できた。同じ手法が30分足らずで複数のチェーンに対して繰り返された。",
    rootCause:
      "スケーリングの丸め方向が一貫してプロトコル有利になっておらず、低流動性の状態で誤差を不変量の歪みにまで増幅できた。",
    aftermath:
      "何度も監査された古いコードでの事件だった。攻撃者は交渉に応じなかった。Balancer Labs は2026年3月に閉鎖し、同年9月に BAL 保有者がプロトコルの段階的な終了を可決した。",
    lesson:
      "丸め方向が常にプロトコル有利であることを不変条件として形式検証・ファジングし、古いコードでも新しいプールの型やフォークで前提が崩れていないかを見直す。",
    sources: [
      { label: "rekt: Balancer", url: "https://rekt.news/balancer-rekt2" },
      {
        label: "Balancer Forum: BIP-892 Distribution of Rescued Funds",
        url: "https://forum.balancer.fi/t/bip-892-distribution-of-rescued-funds-from-balancer-v2-november-3rd-2025-attacks/6883/",
      },
      {
        label: "Coinspect: Balancer Rate Manipulation Exploit",
        url: "https://www.coinspect.com/blog/balancer-rate-manipulation-exploit/",
      },
    ],
  },
  {
    id: "upbit",
    name: "Upbit",
    date: "2025-11-26",
    chain: "Solana",
    target: "cex",
    category: "crypto",
    lossUsdM: 30.4,
    lossNote: "445億ウォン（約3,040万ドル）。韓国時間では2025年11月27日の事件。",
    recovered: "Upbit が自社の資産で顧客の損失を全額補填した。一部は凍結された。",
    attribution: "北朝鮮の関与が疑われている（韓国の当局筋。公式な特定はない）",
    summary: "自社製ウォレットの署名に偏りがあり、公開された取引から秘密鍵を推定されたとみられる。",
    mechanism:
      "Upbit の Solana 用のホットウォレットから、SOL や USDC など20種類以上のトークンが約54分間で外部へ送られた。運営会社 Dunamu の緊急監査では、自社製のウォレットソフトウェアの署名に予測できる偏りがあり、ブロックチェーン上に公開された大量の取引を分析すれば秘密鍵を推定できる脆弱性が見つかった。ただし Upbit は、これが根本原因だとまでは断定していない。",
    rootCause:
      "自社で実装した署名処理の乱数に欠陥があり、公開済みの署名から鍵を推定できた（とされる）。",
    aftermath: "Upbit は鍵を入れ替え、顧客資産の99%をコールドウォレットで保管すると表明した。",
    lesson:
      "署名には検証済みの標準実装（Ed25519 や RFC 6979 の決定論的署名）を使い、独自に改変しない。",
    sources: [
      { label: "The Korea Herald: Upbit hack", url: "https://www.koreaherald.com/article/10625930" },
      {
        label: "Protos: Upbit uncovers private key vulnerability after $30M hack",
        url: "https://protos.com/upbit-uncovers-private-key-vulnerability-after-30m-hack/",
      },
      {
        label: "The Block: Lazarus Group suspected in Upbit hack",
        url: "https://www.theblock.co/news/business/2025-11-27-lazarus-group-suspected-upbit-hack-380743",
      },
    ],
  },
  {
    id: "truebit",
    name: "Truebit",
    date: "2026-01-08",
    chain: "Ethereum",
    target: "defi",
    category: "math",
    lossUsdM: 26.4,
    lossNote: "8,535 ETH。",
    recovered: "回収されていない。",
    summary: "2021年にデプロイされた未監査のコントラクトで、価格計算の整数オーバーフローを突かれた。",
    mechanism:
      "Truebit の Purchase コントラクトは2021年に Solidity 0.6.10 でデプロイされ、ソースは非公開で、公開された監査もなかった。ボンディングカーブで TRU の購入価格を計算する getPurchasePrice() には SafeMath を使わない加算があり、巨大な購入量を指定すると値が uint256 の範囲を一周して、必要な ETH が0になった。攻撃者は buyTRU() で TRU をほぼ無料で発行して sellTRU() で ETH に換える操作を、準備金が尽きるまで繰り返した。",
    rootCause:
      "オーバーフロー検査のないコンパイラのバージョンで書かれた価格計算に、整数オーバーフローがあった。",
    aftermath: "TRU はほぼ無価値になった。盗まれた ETH は数日のうちに Tornado Cash で洗浄された。",
    lesson:
      "放置された古いコントラクトも資産を持つ限り攻撃面になる。使っていないものは資金を引き揚げるか停止する。",
    sources: [
      { label: "CertiK: Truebit Incident Analysis", url: "https://www.certik.com/blog/truebit-incident-analysis" },
      {
        label: "Consensys Diligence: Q1 2026: $130M Lost in DeFi Attacks",
        url: "https://diligence.security/blog/2026/04/q1-2026-130m-lost-in-defi-attacks-what-broke-how-it-worked-what-it-cost/",
      },
    ],
  },
  {
    id: "drift",
    name: "Drift",
    date: "2026-04-01",
    chain: "Solana",
    target: "defi",
    category: "key",
    lossUsdM: 285,
    lossNote: "Drift 自身の発表では約2.96億ドル。TVL の半分超にあたる。",
    recovered: "一部は凍結された。Tether が主導する最大1.475億ドルの復旧の枠組みが発表された。",
    attribution: "北朝鮮（UNC4736。Drift が Mandiant の調査をもとに発表。正式な特定は保留中）",
    summary: "マルチシグの署名者に事前署名をさせ、durable nonce で後から実行して管理権限を奪った。",
    mechanism:
      "攻撃者はクオンツの取引会社を装って約半年にわたり Drift の関係者と関係を築き、Security Council のメンバーに、無害に見えて実際には管理権限を移すトランザクションへ署名させた。Solana の durable nonce を使うと、署名済みのトランザクションは失効せず後から実行できる。Drift は3月26日にタイムロックのない 2-of-5 の Security Council に移行しており、攻撃者は集めた署名を4月1日に実行して管理権限を奪った。管理者として、攻撃者は自作の CarbonVote Token（CVT）を担保に登録し、自ら操作する価格で約1ドルに見せかけ、5億 CVT を預けて約2.5時間で18種類以上の実資産を引き出した。",
    rootCause:
      "署名者へのソーシャルエンジニアリング、durable nonce による遅延実行、タイムロックのない権限の移行が重なった。",
    aftermath:
      "Drift は監査、新しいマルチシグ、専用の署名端末、タイムロックを入れたうえで、規模を縮小して再開する計画を示した。",
    lesson:
      "署名の中身を独立にデコードし、durable nonce を使う事前署名を監視し、権限の変更には必ずタイムロックをかける。",
    sources: [
      { label: "Chainalysis: Lessons from the Drift Hack", url: "https://www.chainalysis.com/blog/lessons-from-the-drift-hack/" },
      {
        label: "BlockSec: Drift Protocol Incident: Multisig Governance Compromise via Durable Nonce",
        url: "https://blocksec.com/blog/drift-protocol-incident-multisig-governance-compromise-via-durable-nonce-exploitation",
      },
      {
        label: "The Hacker News: Drift loses $285 million",
        url: "https://thehackernews.com/2026/04/drift-loses-285-million-in-durable.html",
      },
    ],
  },
  {
    id: "kelpdao",
    name: "KelpDAO",
    date: "2026-04-18",
    chain: "Ethereum ほか",
    target: "bridge",
    category: "key",
    lossUsdM: 292,
    lossNote: "116,500 rsETH。",
    recovered:
      "Arbitrum の Security Council が攻撃者に関連する 30,766 ETH（約7,100万ドル）を凍結した。KelpDAO は約46分で一時停止し、約9,500万ドル分の追加の窃取を防いだ。",
    attribution: "北朝鮮（TraderTraitor。LayerZero の暫定発表）",
    summary: "ブリッジの検証者が1つだけで、その検証者が参照する RPC ノードを乗っ取られた。",
    mechanism:
      "KelpDAO の rsETH は LayerZero の OFT で各チェーンにブリッジされ、Ethereum 側はメッセージの検証を LayerZero Labs の DVN 1つだけに任せる 1-of-1 の構成だった。攻撃者は DVN が参照する内部の RPC ノード2台のバイナリを差し替え、DVN からの問い合わせにだけ偽のチェーンの状態を返すようにし、残る外部の RPC は DDoS で落としてフェイルオーバーさせた。DVN は Unichain 上に存在しない rsETH のバーンを正当と証明し、Ethereum 側は約2.92億ドル分の rsETH を攻撃者に渡した。攻撃者はその一部を Aave に担保として預け、WETH などを借り出した。",
    rootCause:
      "単一の検証者の構成で、検証者が依存するインフラを侵害されると、偽のメッセージを止められなかった。",
    aftermath:
      "Aave は大きな不良債権を抱え、業界の連合による救済が行われた。LayerZero は 1-of-1 構成のアプリへの署名を止め、KelpDAO は別のブリッジに移った。両者は構成の責任をめぐって公に対立した。",
    lesson:
      "ブリッジの検証は独立した複数の検証者と独立したノードの組み合わせにし、既定の設定のまま運用しない。",
    sources: [
      { label: "LayerZero: KelpDAO Incident Statement", url: "https://layerzero.network/blog/kelpdao-incident-statement" },
      {
        label: "Chainalysis: KelpDAO Bridge Exploit (April 2026)",
        url: "https://www.chainalysis.com/blog/kelpdao-bridge-exploit-april-2026/",
      },
      { label: "OpenZeppelin: Lessons from the KelpDAO Hack", url: "https://www.openzeppelin.com/news/lessons-from-kelpdao-hack" },
    ],
  },
  {
    id: "bonkdao",
    name: "BonkDAO",
    date: "2026-07-06",
    chain: "Solana",
    target: "defi",
    category: "economic",
    lossUsdM: 20,
    lossNote: "約4.43兆 BONK。日付は被害が公表された日。",
    recovered: "回収は報告されていない。",
    summary: "約440万ドルで投票権を買い集め、トレジャリーを送金する隠し命令を含む提案を通した。",
    mechanism:
      "攻撃者は Solana の Realms 上で、「賛成した人に報酬を配る」と見せかけて、トレジャリーから4.43兆 BONK を攻撃者に送る命令を隠した提案を出した。取引所で約440万ドル分の BONK（総供給の約1%、定足数に相当）を買い集めて投票し、投票率2.9%のなか99.9%の賛成で可決させた。提案はタイムロックなしで、投票終了の直後に自動で実行された。",
    rootCause:
      "定足数が低く投票率も低いうえ、実行前のタイムロックがなく、投票権を買うだけで提案を通せた。",
    aftermath: "BonkDAO は取引所や法執行機関と追跡を続けている。",
    lesson: "提案に含まれる命令をデコードして表示し、定足数を投票の実態に合わせ、可決から実行まで時間を置く。",
    sources: [
      {
        label: "The Block: BonkDAO loses $20 million following malicious governance proposal",
        url: "https://www.theblock.co/post/407343/bonkdao-loses-20-million-following-malicious-governance-proposal-attack",
      },
      {
        label: "Halborn: Explained: The BonkDAO Hack (July 2026)",
        url: "https://www.halborn.com/blog/post/explained-the-bonkdao-hack-july-2026",
      },
    ],
  },
  {
    id: "coldcard",
    name: "Coldcard",
    date: "2026-07-30",
    chain: "Bitcoin",
    target: "wallet",
    category: "crypto",
    lossUsdM: 116,
    lossNote: "推計は約7,000万〜1.3億ドルで、集計が続いている。被害者の多くは個人の利用者。",
    recovered: "回収は報告されていない。",
    summary: "ファームウェアの設定ミスで、シードが予測できる弱い乱数から作られていた。",
    mechanism:
      "Coinkite の Coldcard のファームウェア（2021年3月の4.0.1以降）では、ライブラリの移行時に同じインターフェースを持つ2つの乱数関数が取り違えられ、ハードウェアの真性乱数ではなく、チップの ID や時刻など予測できる入力にもとづく弱い乱数でシードが作られていた。ビルド時の検査は設定値の有無しか見ておらず、値が0のまま見逃された。有効なエントロピーは128ビットから機種により約40〜72ビットに下がり、端末に触れずに総当たりでシードを割り出せた。攻撃者は7月30日から4回にわたり、該当するウォレットから約1,800 BTC を移した。",
    rootCause: "シードを作る乱数源の設定を誤り、エントロピーが総当たりできる水準まで下がっていた。",
    aftermath:
      "Coinkite は修正版のファームウェアを出したが、既存のシードは更新しても直らず、新しいシードへの移行が必要になった。サイコロでシードを作った利用者は影響を受けない。",
    lesson:
      "鍵生成の乱数源はビルド設定まで含めて検証し、生成された鍵のエントロピーを出荷前に統計的に検査する。",
    sources: [
      {
        label: "TRM Labs: Inside the $116 Million Coldcard Hack",
        url: "https://www.trmlabs.com/resources/blog/the-largest-hardware-wallet-exploit-of-2026-inside-the-usd-116-million-coldcard-hack",
      },
      {
        label: "Bitcoin.com: The Coldcard Exploit Explained",
        url: "https://news.bitcoin.com/featured/the-coldcard-exploit-explained-who-lost-bitcoin-and-whos-at-risk/",
      },
    ],
  },
  {
    id: "tectonic",
    name: "Tectonic",
    date: "2026-08-30",
    chain: "Cronos",
    target: "defi",
    category: "economic",
    lossUsdM: 74,
    lossNote:
      "借り出された額。Cronos がチェーンを巻き戻したため、実損は停止前に Ethereum へ移された約600万ドルとみられる（推計）。",
    recovered: "Cronos はバリデータの合意でチェーン全体を止め、攻撃前の状態に巻き戻した。",
    summary: "流動性の薄い TONIC の価格を約100倍につり上げ、担保にして実資産を借り出した。",
    mechanism:
      "Cronos 最大のレンディングプロトコルの Tectonic で、攻撃者は流動性の薄い TONIC トークンの価格を約20分で約100倍に上げ、それを担保に約7,400万ドル分の実資産を借り出した。担保評価に、操作しやすい市場価格がそのまま使われていた。",
    rootCause: "流動性の薄いトークンを担保として認め、その操作できる価格をそのまま担保評価に使っていた。",
    aftermath:
      "単一のコントラクトではなくチェーン全体を止めて巻き戻すという異例の対応は、分散性の観点から議論を呼んだ。",
    lesson:
      "2022年の Mango と同じ手口であり、流動性の薄い資産を担保にするなら、厳しい掛け目と借入上限を設ける。",
    sources: [
      {
        label: "BleepingComputer: Cronos blockchain restarts after $74 million Tectonic exploit",
        url: "https://www.bleepingcomputer.com/news/security/cronos-blockchain-restarts-after-74-million-tectonic-exploit/",
      },
      {
        label: "Coin360: Cronos Tectonic exploit",
        url: "https://coin360.com/news/cronos-tectonic-exploit-tonic-price-manipulation",
      },
    ],
  },
  {
    id: "liquid-network",
    name: "Liquid Network",
    date: "2026-09-06",
    chain: "Liquid・Bitcoin",
    target: "bridge",
    category: "logic",
    lossUsdM: 319,
    lossNote: "約4,000 L-BTC が裏付けなしに発行され、3,996.02 BTC が Bitcoin 上に払い出された。",
    recovered:
      "攻撃者は「ホワイトハット」を名乗って交渉し、翌日に3,400 BTC（約85%）を返した。約600 BTC は戻っていない。",
    summary: "検証結果のキャッシュでキーが衝突し、range proof の検証を飛ばして L-BTC を無から発行された。",
    mechanism:
      "Liquid は Blockstream が開発した Bitcoin のフェデレーション型サイドチェーンで、金額を秘匿するため各出力に range proof を求める。ノード実装の Elements は range proof の検証結果をキャッシュしていたが、キャッシュのキーが長さのプレフィックスなしでフィールドを連結していたため、細工した証明のバイト列が検証済みのエントリと一致し、本来の検証が飛ばされた。このバグは、キャッシュの別の不具合を直す修正に含まれていた。攻撃者は裏付けのない約4,000 L-BTC を発行し、フェデレーションの加盟者 SideSwap のペグアウトを通じて BTC に換えた。",
    rootCause: "コンセンサス検証のキャッシュでキーが衝突し、range proof の検証が迂回された。",
    aftermath:
      "Blockstream の報告書は、SideSwap がペグアウトの署名鍵をオンラインに置き、金額や速度の上限も設けず、約4,000 BTC の注文が人の確認なしに通ったことを指摘した。",
    lesson:
      "キャッシュのキーは長さを含めて一意に符号化し、セキュリティ修正こそ再監査する。大口の払い出しには上限と人の確認を挟む。",
    sources: [
      {
        label: "Blockstream: Liquid Network Security Incident Assessment",
        url: "https://blog.blockstream.com/liquid-network-security-incident-assessment/",
      },
      {
        label: "TRM Labs: 2026's biggest hack to date: Liquid Network",
        url: "https://www.trmlabs.com/resources/blog/2026s-biggest-hack-to-date-attackers-drained-usd-319-million-in-bitcoin-from-liquid-network-then-returned-85-of-funds",
      },
    ],
  },
  {
    id: "bitget",
    name: "Bitget",
    date: "2026-09-24",
    chain: "Ethereum ほか",
    target: "cex",
    category: "key",
    lossUsdM: 387.5,
    lossNote: "当初は約3.52億ドルと発表され、後に約3.88億ドルに修正された。12のアドレス、11のチェーン。",
    recovered:
      "約110万ドルが凍結された。Bitget は損失を Protection Fund で吸収し、利用者の残高に影響はないとした。",
    attribution: "北朝鮮（Chainalysis が帰属）",
    summary:
      "第三者製のセキュリティ製品のゼロデイから社内に入り、偽造した出金指示を正規の処理として通した。",
    mechanism:
      "攻撃者は Bitget が使っていた第三者製のセキュリティ製品のゼロデイ脆弱性を突いて社内の管理システムに入り、高い権限の認証情報を盗んだ。その権限でウォレットシステムに偽造した出金指示を書き込み、リスクチェックを迂回して、ホットウォレットとウォームウォレットから資産を送らせた。秘密鍵とコールドウォレットは無事で、署名システムは偽の指示を正規の出金として処理した。",
    rootCause: "社内の出金承認の経路が乗っ取られ、鍵が無事なまま偽造された指示に署名がされた。",
    aftermath:
      "Bitget は脆弱性を修正し、数日かけて出金を再開した。Chainalysis によれば、この事件で2026年の北朝鮮による窃取額は10億ドルを超えた。",
    lesson:
      "署名システムは上流の指示を無条件に信じず、出金の宛先・額・頻度を署名の直前に独立して検証する。",
    sources: [
      {
        label: "Bitget: Security Incident (September 2026)",
        url: "https://www.bitget.com/campaigns/bitget-security-incident-2026",
      },
      {
        label: "Fortune: North Korea behind $387 million Bitget attack",
        url: "https://fortune.com/2026/09/25/north-korea-bitget-387-million-crypto-attack/",
      },
      {
        label: "Decrypt: Chainalysis Used AI to Trace the $387M Bitget Hack Back to North Korea",
        url: "https://decrypt.co/380005/chainalysis-ai-87m-bitget-hack-north-korea",
      },
    ],
  },
];
