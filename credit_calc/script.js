'use strict'
function calculate () {
    var amount = document.getElementById("amount");
    var apr = document.getElementById("apr");
    var years = document.getElementById("years");
    var zipcode = document.getElementById("zipcode");
    var payment = document.getElementById("payment");
    var total = document.getElementById("total");
    var totalinterest = document.getElementById("totalinterest");

    var principal = parseFloat(amount.value);
    var interest = parseFloat(apr.value) / 100 / 12;
    var payments = parseFloat(years.value) * 12;

    var x = Math.pow(1 + interest, payments); // Math.pow() вы­чис­ля­ет сте­пень
    var monthly = (principal*x*interest)/(x-1);

    if (isFinite(monthly)) {
        // За­пол­нить по­ля вы­во­да, ок­руг­лив ре­зуль­та­ты до 2 де­ся­тич­ных зна­ков
        payment.innerHTML = monthly.toFixed(2);
        total.innerHTML = (monthly * payments).toFixed(2);
        totalinterest.innerHTML = ((monthly*payments)-principal).toFixed(2);
        // Со­хра­нить ввод поль­зо­ва­те­ля, что­бы мож­но бы­ло вос­ста­но­вить дан­ные
        // при сле­дую­щем от­кры­тии стра­ни­цы
        save(amount.value, apr.value, years.value, zipcode.value);
        // Рек­ла­ма: оты­скать и ото­бра­зить ссыл­ки на сай­ты ме­ст­ных
        // кре­дит­ных уч­ре­ж­де­ний, но иг­но­ри­ро­вать се­те­вые ошиб­ки
        try { // Пе­ре­хва­ты­вать все ошиб­ки, воз­ни­каю­щие в этих фи­гур­ных скоб­ках
        getLenders(amount.value, apr.value, years.value, zipcode.value);
        }
        catch(e) { /* И иг­но­ри­ро­вать эти ошиб­ки */ }
        // В за­клю­че­ние вы­вес­ти гра­фик из­ме­не­ния ос­тат­ка по кре­ди­ту, а так­же
        // гра­фи­ки сумм, вы­пла­чи­вае­мых в по­га­ше­ние кре­ди­та и по про­цен­там
        chart(principal, interest, monthly, payments);}
        else {
        // Ре­зуль­тат не яв­ля­ет­ся чис­лом или име­ет бес­ко­неч­ное зна­че­ние,
        // что оз­на­ча­ет, что бы­ли по­лу­че­ны не­пол­ные или не­кор­рект­ные дан­ные.
        // Очи­стить все ре­зуль­та­ты, вы­ве­ден­ные ра­нее.
        payment.innerHTML = ""; // Сте­реть со­дер­жи­мое этих эле­мен­тов
        total.innerHTML = ""
        totalinterest.innerHTML = "";
        chart(); // При вы­зо­ве без ар­гу­мен­тов очи­ща­ет диа­грам­му
        }
    }

    // Со­хра­нить ввод поль­зо­ва­те­ля в свой­ст­вах объ­ек­та localStorage. Зна­че­ния этих свойств
// бу­дут дос­туп­ны при по­втор­ном по­се­ще­нии стра­ни­цы. В не­ко­то­рых бро­узе­рах (на­при­мер,
// в Firefox) воз­мож­ность со­хра­не­ния не под­дер­жи­ва­ет­ся, ес­ли стра­ни­ца от­кры­ва­ет­ся
// с ад­ре­сом URL ви­да file://. Од­на­ко она под­дер­жи­ва­ет­ся при от­кры­тии стра­ни­цы че­рез HTTP.
function save(amount, apr, years, zipcode) {
    if (window.localStorage) { // Вы­пол­нить со­хра­не­ние, ес­ли под­дер­жи­ва­ет­ся
    localStorage.loan_amount = amount;
    localStorage.loan_apr = apr;
    localStorage.loan_years = years;
    localStorage.loan_zipcode = zipcode;
    }
   }
   // Ав­то­ма­ти­че­ски вос­ста­но­вить по­ля вво­да при за­груз­ке до­ку­мен­та.
   window.onload = function() {
    // Ес­ли бро­узер под­дер­жи­ва­ет localStorage и име­ют­ся со­хра­нен­ные дан­ные
    if (window.localStorage && localStorage.loan_amount) {
    document.getElementById("amount").value = localStorage.loan_amount;
    document.getElementById("apr").value = localStorage.loan_apr;
    document.getElementById("years").value = localStorage.loan_years;
    document.getElementById("zipcode").value = localStorage.loan_zipcode;
    }
   };
   // Пе­ре­дать ввод поль­зо­ва­те­ля сер­вер­но­му сце­на­рию, ко­то­рый мо­жет (тео­ре­ти­че­ски) воз­вра­щать
   // спи­сок ссы­лок на сай­ты ме­ст­ных кре­дит­ных уч­ре­ж­де­ний, го­то­вых пре­дос­та­вить кре­дит.
   // Дан­ный при­мер не вклю­ча­ет фак­ти­че­скую реа­ли­за­цию та­ко­го сце­на­рия по­ис­ка кре­дит­ных
   // уч­ре­ж­де­ний. Но ес­ли та­кой сце­на­рий уже име­ет­ся, дан­ная функ­ция мог­ла бы ра­бо­тать с ним.
   function getLenders(amount, apr, years, zipcode) {
    // Ес­ли бро­узер не под­дер­жи­ва­ет объ­ект XMLHttpRequest, не де­лать ни­че­го
    if (!window.XMLHttpRequest) return;
    // Оты­скать эле­мент для ото­бра­же­ния спи­ска кре­дит­ных уч­ре­ж­де­ний
    var ad = document.getElementById("lenders");
    if (!ad) return; // Вый­ти, ес­ли эле­мент от­сут­ст­ву­ет
    // Пре­об­ра­зо­вать ввод поль­зо­ва­те­ля в па­ра­мет­ры за­про­са в стро­ке URL
    var url = "getLenders.php" + // Ад­рес URL служ­бы плюс
    "?amt=" + encodeURIComponent(amount) + // дан­ные поль­зо­ва­те­ля
    "&apr=" + encodeURIComponent(apr) + // в стро­ке за­про­са
    "&yrs=" + encodeURIComponent(years) +
    "&zip=" + encodeURIComponent(zipcode);
    // По­лу­чить со­дер­жи­мое по за­дан­но­му ад­ре­су URL с по­мо­щью XMLHttpRequest
    var req = new XMLHttpRequest(); // Соз­дать но­вый за­прос
    req.open("GET", url); // Ука­зать тип за­про­са HTTP GET для urlreq.send(null); // От­пра­вить за­прос без те­ла
    // Пе­ред воз­вра­том за­ре­ги­ст­ри­ро­вать об­ра­бот­чик со­бы­тия, ко­то­рый бу­дет вы­зы­вать­ся
    // при по­лу­че­нии HTTP-от­ве­та от сер­ве­ра. Та­кой при­ем асин­хрон­но­го про­грам­ми­ро­ва­ния
    // яв­ля­ет­ся до­воль­но обыч­ным в кли­ент­ском Ja­va­Script.
    req.onreadystatechange = function() {
    if (req.readyState == 4 && req.status == 200) {
    // Ес­ли мы по­па­ли сю­да, сле­до­ва­тель­но, был по­лу­чен кор­рект­ный HTTP-от­вет
    var response = req.responseText; // HTTP-от­вет в ви­де стро­ки
    var lenders = JSON.parse(response); // Пре­об­ра­зо­вать в JS-мас­сив
    // Пре­об­ра­зо­вать мас­сив объ­ек­тов lender в HTML-стро­ку
    var list = "";
    for(var i = 0; i < lenders.length; i++) {
    list += "<li><a href='" + lenders[i].url + "'>" +
    lenders[i].name + "</a>";
    }
    // Ото­бра­зить по­лу­чен­ную HTML-стро­ку в эле­мен­те,
    // ссыл­ка на ко­то­рый бы­ла по­лу­че­на вы­ше.
    ad.innerHTML = "<ul>" + list + "</ul>";
    }
    }
   }
   // Гра­фик по­ме­сяч­но­го из­ме­не­ния ос­тат­ка по кре­ди­ту, а так­же гра­фи­ки сумм,
// вы­пла­чи­вае­мых в по­га­ше­ние кре­ди­та и по про­цен­там в HTML-эле­мен­те <canvas>.
// Ес­ли вы­зы­ва­ет­ся без ар­гу­мен­тов, про­сто очи­ща­ет ра­нее на­ри­со­ван­ные гра­фи­ки.
function chart(principal, interest, monthly, payments) {
    var graph = document.getElementById("graph"); // Ссыл­ка на тег <canvas>
    graph.width = graph.width; // Ма­гия очи­ст­ки эле­мен­та canvas
    // Ес­ли функ­ция вы­зва­на без ар­гу­мен­тов или бро­узер не под­дер­жи­ва­ет
    // эле­мент <canvas>, то про­сто вер­нуть управ­ле­ние.
    if (arguments.length == 0 || !graph.getContext) return;
    // По­лу­чить объ­ект "кон­тек­ста" для эле­мен­та <canvas>,
    // ко­то­рый оп­ре­де­ля­ет на­бор ме­то­дов ри­со­ва­ния
    var g = graph.getContext("2d"); // Ри­сование вы­пол­ня­ет­ся с по­мо­щью это­го объ­ек­та
    var width = graph.width, height = graph.height; // По­лу­чить раз­мер хол­ста
    // Сле­дую­щие функ­ции пре­об­ра­зу­ют ко­ли­че­ст­во ме­сяч­ных пла­те­жей
    // и де­неж­ные сум­мы в пик­се­лы
    function paymentToX(n) { return n * width/payments; }
    function amountToY(a) { return height-(a*height/(monthly*payments*1.05));}
    // Пла­те­жи - пря­мая ли­ния из точ­ки (0,0) в точ­ку (payments,monthly*payments)
    g.moveTo(paymentToX(0), amountToY(0)); // Из ниж­не­го ле­во­го уг­ла
    g.lineTo(paymentToX(payments), // В пра­вый верх­ний
    amountToY(monthly*payments));
    g.lineTo(paymentToX(payments), amountToY(0)); // В пра­вый ниж­ний
    g.closePath(); // И об­рат­но в на­ча­ло
    g.fillStyle = "#f88"; // Свет­ло-крас­ный
    g.fill(); // За­лить тре­уголь­ник
    g.font = "bold 12px sans-serif"; // Оп­ре­де­лить шрифт
    g.fillText("Всего процентных платежей", 20,20); // Вы­вес­ти текст в ле­ген­де
    // Кри­вая на­ко­п­лен­ной сум­мы по­га­ше­ния кре­ди­та не яв­ля­ет­ся ли­ней­ной
    // и вы­вод ее реа­ли­зу­ет­ся не­мно­го слож­нее
    var equity = 0;
 g.beginPath(); // Но­вая фи­гу­ра
 g.moveTo(paymentToX(0), amountToY(0)); // из ле­во­го ниж­не­го уг­ла
 for(var p = 1; p <= payments; p++) {
 // Для ка­ж­до­го пла­те­жа вы­яс­нить до­лю вы­плат по про­цен­там
 var thisMonthsInterest = (principal-equity)*interest;
 equity += (monthly - thisMonthsInterest); // Ос­та­ток - по­га­ше­ние кред.
 g.lineTo(paymentToX(p),amountToY(equity)); // Ли­нию до этой точ­ки
 }
 g.lineTo(paymentToX(payments), amountToY(0)); // Ли­нию до оси X
 g.closePath(); // И опять в нач. точ­ку
 g.fillStyle = "green"; // Зе­ле­ный цвет
 g.fill(); // За­лить обл. под кри­вой
 g.fillText("Тело кредита", 20,35); // Над­пись зе­ле­ным цве­том
 // По­вто­рить цикл, как вы­ше, но на­ри­со­вать гра­фик ос­тат­ка по кре­ди­ту
 var bal = principal;
 g.beginPath();
 g.moveTo(paymentToX(0),amountToY(bal));
 for(var p = 1; p <= payments; p++) {
 var thisMonthsInterest = bal*interest;
 bal -= (monthly - thisMonthsInterest); // Ос­та­ток от по­гаш. по кре­ди­ту
 g.lineTo(paymentToX(p),amountToY(bal)); // Ли­нию до этой точ­ки
 }
 g.lineWidth = 3; // Жир­ная ли­ния
 g.stroke(); // На­ри­со­вать кри­вую гра­фи­ка
 g.fillStyle = "black"; // Чер­ный цвет для тек­ста
 g.fillText("Остаток погашения", 20,50); // Эле­мент ле­ген­ды
 // На­ри­со­вать от­мет­ки лет на оси X
 g.textAlign="center"; // Текст ме­ток по цен­тру
 var y = amountToY(0); // Ко­ор­ди­на­та Y на оси X
 for(var year=1; year*12 <= payments; year++) { // Для ка­ж­до­го го­да
 var x = paymentToX(year*12); // Вы­чис­лить по­зи­цию мет­ки
 g.fillRect(x-0.5,y-3,1,3); // На­ри­со­вать мет­ку
 if (year == 1) g.fillText("Year", x, y-5); // Под­пи­сать ось
 if (year % 5 == 0 && year*12 !== payments) // Чис­ла че­рез ка­ж­дые 5 лет
 g.fillText(String(year), x, y-5);
 }
 // Сум­мы пла­те­жей у пра­вой гра­ни­цы
 g.textAlign = "right"; // Текст по пра­во­му краю
 g.textBaseline = "middle"; // Цен­три­ро­вать по вер­ти­ка­ли
 var ticks = [monthly*payments, principal]; // Вы­вес­ти две сум­мы
 var rightEdge = paymentToX(payments); // Ко­ор­ди­на­та X на оси Y
 for(var i = 0; i < ticks.length; i++) { // Для ка­ж­дой из 2 сумм
 var y = amountToY(ticks[i]); // Оп­ре­де­лить ко­ор­ди­на­ту Y
 g.fillRect(rightEdge-3, y-0.5, 3,1); // На­ри­со­вать мет­ку
 g.fillText(String(ticks[i].toFixed(0)), // И вы­вес­ти ря­дом сум­му.
 rightEdge-5, y);
 }
}
