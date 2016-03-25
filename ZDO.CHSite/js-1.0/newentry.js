var zdNewEntry = (function () {
  "use strict";
  var template =
    '<div class="formBlock active" id="blockSimp">' +
    '  <div class="formBlockLabel">Egyszerűsített</div>' +
    '  <div class="formBlockFrame">' +
    '    <input id="newEntrySimp" maxlength="8" readonly/>' +
    '    <div class="newEntryKnown" title="A CEDICT-ben létező szó">&bull;</div>' +
    '    <div class="formButtonRight accept" id="acceptSimp">' +
    '      <img src="static/sign.svg" alt=""/>' +
    '    </div>' +
    '    <div class="formButtonRight edit" id="editSimp">' +
    '      <img src="static/draw.svg" alt=""/>' +
    '    </div>' +
    '    <div class="formNote" id="noteSimp">' +
    '      A folytatáshoz kattints a zöld <i>Jóváhagyás</i> gombra, vagy üss Entert.' +
    '    </div>' +
    '    <div class="formErrors" id="errorsSimp">' +
    '      Az automatikus ellenőrzés az alábbi problémákat találta.' +
    '      Kérlek, korrigáld ezeket, majd kattints ismét a zöld <i>Jóváhagyás</i> gombra.' +
    '      <ul id="errorListSimp"></ul>' +
    '    </div>' +
    '  </div>' +
    '</div>' +
    '<div class="formBlock future" id="blockTrad">' +
    '  <div class="formBlockLabel">Hagyományos</div>' +
    '  <div class="formBlockFrame">' +
    '    <div id="newEntryTradCtrl">' +
    '      &nbsp;' +
    '    </div>' +
    '    <div class="newEntryKnown" title="A CEDICT-ben létező szó">&bull;</div>' +
    '    <div class="formButtonRight accept" id="acceptTrad">' +
    '      <img src="static/sign.svg" alt=""/>' +
    '    </div>' +
    '    <div class="formButtonRight edit" id="editTrad">' +
    '      <img src="static/draw.svg" alt=""/>' +
    '    </div>' +
    '    <div class="formNote">' +
    '      Ha nem a megfelelő hagyományos írásjegy áll az első helyen, a kívánt elemre' +
    '      kattintva helyesbítheted. Ha kész, kattints a zöld <i>Jóváhagyás</i> gombra.' +
    '    </div>' +
    '  </div>' +
    '</div>' +
    '<div class="formBlock future" id="blockPinyin">' +
    '  <div class="formBlockLabel">Pinyin</div>' +
    '  <div class="formBlockFrame">' +
    '    <div id="newEntryPinyinCtrl">' +
    '      &nbsp;' +
    '    </div>' +
    '    <div class="newEntryKnown" title="A CEDICT-ben létező szó">&bull;</div>' +
    '    <div class="formButtonRight accept" id="acceptPinyin">' +
    '      <img src="static/sign.svg" alt=""/>' +
    '    </div>' +
    '    <div class="formButtonRight edit" id="editPinyin">' +
    '      <img src="static/draw.svg" alt=""/>' +
    '    </div>' +
    '    <div class="formNote" id="notePinyin">' +
    '      Ellenőrizd a szótagok pinyin-átiratát. Ha kész, kattints a zöld <i>Jóváhagyás</i> gombra.' +
    '    </div>' +
    '    <div class="formErrors" id="errorsPinyin">' +
    '      Duplikátum: ilyen címszó már létezik (megegyező egyszerűsített és hagyományos írásjegyek,' +
    '      azonos kiejtéssel).' +
    '    </div>' +
    '  </div>' +
    '</div>' +
    '<div class="formBlock future" id="blockTrg">' +
    '  <div class="formBlockLabel">Magyar</div>' +
    '  <div class="formBlockFrame">' +
    '    <textarea id="newEntryTrg" maxlength="1024" readonly></textarea>' +
    '    <div class="formButtonRight accept" id="acceptTrg">' +
    '      <img src="static/sign.svg" alt=""/>' +
    '    </div>' +
    '    <div class="formButtonRight edit" id="editTrg">' +
    '      <img src="static/draw.svg" alt=""/>' +
    '    </div>' +
    '    <div class="formNote" id="noteTrg">' +
    '      Add meg, újsorokkal elválasztva, a címszó magyar jelentéseit.' +
    '      Ha kész, kattints a zöld <i>Jóváhagyás</i> gombra.' +
    '    </div>' +
    '    <div class="formErrors" id="errorsTrg">' +
    '      Az automatikus ellenőrzés az alábbi problémákat találta.' +
    '      Kérlek, korrigáld ezeket, majd kattints ismét a zöld <i>Jóváhagyás</i> gombra.' +
    '      <ul id="errorListTrg"></ul>' +
    '    </div>' +
    '  </div>' +
    '</div>' +
    '<div class="formBlock future hidden" id="blockRefs">' +
    '  <div class="formBlockLabel">Referenciák</div>' +
    '  <div class="formBlockFrame">' +
    '    <div id="newEntryRefEntries"></div>' +
    '  </div>' +
    '</div>' +
    '<div class="formBlock future hidden" id="blockReview">' +
    '  <div class="formBlockLabel">Előnézet</div>' +
    '  <div class="formBlockFrame">' +
    '    <div id="newEntryRender"></div>' +
    '    <input id="newEntryNote" maxlength="128" placeholder="Megjegyzés, forrásmegjelölés" readonly/>' +
    '    <div class="formErrors" id="errorsReview">' +
    '      Kérlek, fűzz hozzá egy rövid megjegyzést vagy forrásmegjelölést.' +
    '    </div>' +
    '    <div class="formSubmit" id="newEntrySubmit">Eltárolom</div>' +
    '  </div>' +
    '</div>';

  var server;

  function documentReady() {
    $("#newEntrySimp").bind("compositionstart", onSimpCompStart);
    $("#newEntrySimp").bind("compositionend", onSimpCompEnd);
    $("#newEntrySimp").bind("input", onSimpChanged);
    $("#newEntrySimp").keyup(onSimpKeyUp);
    $("#acceptSimp").click(onSimpAccept);
    $("#editSimp").click(onSimpEdit);
    $("#acceptTrad").click(onTradAccept);
    $("#editTrad").click(onTradEdit);
    $("#acceptPinyin").click(onPinyinAccept);
    $("#editPinyin").click(onPinyinEdit);
    $("#acceptTrg").click(onTrgAccept);
    $("#editTrg").click(onTrgEdit);
    $("#newEntrySubmit").click(onSubmit);

    $("#newEntrySimp").prop("readonly", false);
    $("#newEntrySimp").focus();
  }

  $(document).ready(function () {
    documentReady();
  });

  function setActive(block) {
    $(".formBlock").removeClass("active");
    $(".formBlock").removeClass("ready");
    $(".formBlock").removeClass("future");
    $("#blockRefs").addClass("hidden");
    $("#blockReview").addClass("hidden");

    $("#newEntrySimp").prop("readonly", true);
    $("#newEntryTrg").prop("readonly", true);
    $("#newEntryNote").prop("readonly", true);
    $(".formErrors").removeClass("visible");
    $(".formNote").removeClass("hidden");
    if (block == "simp") {
      $("#newEntrySimp").prop("readonly", false);
      $("#newEntrySimp").focus();
      $("#blockSimp").addClass("active");
      $("#blockTrad").addClass("future");
      $("#blockPinyin").addClass("future");
      $("#blockTrg").addClass("future");
      $("#blockRefs").addClass("future");
      $("#blockReview").addClass("future");
      $("#editTrad").removeClass("hidden");
      $("#editPinyin").removeClass("hidden");
    }
    else if (block == "trad") {
      $("#blockSimp").addClass("ready");
      $("#blockTrad").addClass("active");
      $("#blockPinyin").addClass("future");
      $("#blockTrg").addClass("future");
      $("#blockRefs").addClass("future");
      $("#blockReview").addClass("future");
      $("#editPinyin").removeClass("hidden");
    }
    else if (block == "pinyin") {
      $("#blockSimp").addClass("ready");
      $("#blockTrad").addClass("ready");
      $("#blockPinyin").addClass("active");
      $("#blockTrg").addClass("future");
      $("#blockRefs").addClass("future");
      $("#blockReview").addClass("future");
    }
    else if (block == "trg") {
      $("#newEntryTrg").prop("readonly", false);
      $("#newEntryTrg").focus();
      $("#blockSimp").addClass("ready");
      $("#blockTrad").addClass("ready");
      $("#blockPinyin").addClass("ready");
      $("#blockTrg").addClass("active");
      $("#blockRefs").addClass("active");
      $("#blockReview").addClass("future");
    }
    else if (block == "review") {
      $("#blockReview").removeClass("hidden");
      $("#newEntryNote").prop("readonly", false);
      $("#newEntryNote").focus();
      $("#blockSimp").addClass("ready");
      $("#blockTrad").addClass("ready");
      $("#blockPinyin").addClass("ready");
      $("#blockTrg").addClass("ready");
      $("#blockReview").addClass("active");
    }
  }

  function onSubmit(evt) {
    if ($("#newEntryNote").val().length < 6) {
      $(".formErrors").removeClass("visible");
      $("#errorsReview").addClass("visible");
      $("#newEntryNote").focus();
    }
    else {
      $("#errorsReview").removeClass("visible");
    }
  }

  // Event handler: user clicked pencil to continue editing target
  function onTrgEdit(evt) {
    setActive("trg");
    $("#blockRefs").removeClass("hidden");
  }

  // Event handler: user clicked green button to accept translation
  function onTrgAccept(evt) {
    if ($("#acceptTrg").hasClass("disabled")) return;
    server.verifyTrg($("#newEntrySimp").val(), getTrad(), getPinyin(), $("#newEntryTrg").val(), onTrgVerified);
    $("#acceptTrg").addClass("disabled");
  }

  // API callback: translation verified; we might have a preview
  function onTrgVerified(res) {
    $("#acceptTrg").removeClass("disabled");
    if (!res.passed) {
      $(".formErrors").removeClass("visible");
      $("#errorsTrg").addClass("visible");
      $("#noteTrg").addClass("hidden");
      $("#errorListTrg").empty();
      for (var i = 0; i < res.errors.length; ++i) {
        var liErr = $('<li/>');
        liErr.text(res.errors[i]);
        $("#errorListTrg").append(liErr);
      }
      $("#newEntryTrg").focus();
    }
    else {
      $("#errorsTrg").removeClass("visible");
      $("#noteTrg").removeClass("hidden");
      $("#newEntryRender").html(res.preview);
      setActive("review");
    }
  }

  // Even handler: user accepts content of pinyin field
  function onPinyinAccept(evt) {
    if ($("#acceptPinyin").hasClass("disabled")) return;
    server.verifyHead($("#newEntrySimp").val(), getTrad(), getPinyin(), onHeadVerified);
    $("#acceptPinyin").addClass("disabled");
  }

  // API callback: entire headword has been verified (is it a duplicate?).
  function onHeadVerified(res) {
    $("#acceptPinyin").removeClass("disabled");
    if (!res.passed) {
      $(".formErrors").removeClass("visible");
      $("#errorsPinyin").addClass("visible");
      $("#notePinyin").addClass("hidden");
      $("#blockRefs").addClass("hidden");
    }
    else {
      $("#errorsPinyin").removeClass("visible");
      $("#notePinyin").removeClass("hidden");
      setActive("trg");
      $("#blockRefs").removeClass("hidden");
      $("#newEntryRefEntries").html(res.ref_entries_html);
    }
  }

  // Event handler: user clicks pencil to return to editing pinyin field.
  function onPinyinEdit(evt) {
    setActive("pinyin");
  }

  // Event handler: user clicks pencil to return to editing traditional field.
  function onTradEdit(evt) {
    setActive("trad");
  }

  // Event handler: traditional field is accepted by user.
  function onTradAccept(evt) {
    if ($("#acceptTrad").hasClass("disabled")) return;
    if (isPinyinUnambiguous()) {
      $("#editPinyin").addClass("hidden");
      // Instead of activating target, let's get headword verified
      onPinyinAccept();
    }
    else {
      $("#editPinyin").removeClass("hidden");
      setActive("pinyin");
    }
  }

  // Simplified field is composing (IME). Blocks API calls while field has shadow text.
  var simpComposing = false;

  // Event handler: IME composition starts in simplified field.
  function onSimpCompStart(evt) {
    simpComposing = true;
  }

  // Event handler: IME composition ends in simplified field.
  function onSimpCompEnd(evt) {
    simpComposing = false;
  }

  function onSimpKeyUp(evt) {
    if (evt.which == 13) {
      evt.preventDefault();
      onSimpAccept();
      return false;
    }
  }

  // Handles change of simplified field. Invokes server to retrieve data for subsequent HW fields.
  function onSimpChanged(evt) {
    if (simpComposing) return;
    server.processSimp($("#newEntrySimp").val(), onSimpProcessed);
  }

  // Callback when API finished processing current content of simplified field.
  function onSimpProcessed(trad, pinyin, known_hw) {
    $("#newEntryTradCtrl").empty();
    for (var  i = 0; i < trad.length; ++i) {
      var tpos = $('<div class="newEntryTradPos"/>');
      for (var j = 0; j < trad[i].length; ++j) {
        var tspan = $('<span />');
        if (j != 0) tspan.addClass("tradAlt");
        tspan.text(trad[i][j]);
        tpos.append(tspan);
      }
      $("#newEntryTradCtrl").append(tpos);
    }
    if (trad.length == 0) $("#newEntryTradCtrl").append('\xA0');
    if (known_hw) $(".newEntryKnown").addClass("visible");
    else $(".newEntryKnown").removeClass("visible");
    $(".tradAlt").unbind("click", onTradAltClicked);
    $(".tradAlt").click(onTradAltClicked);

    updatePinyin(pinyin);
  }

  // Handles simplified's "accept" event. Invokes server to check input.
  function onSimpAccept(evt) {
    if ($("#acceptSimp").hasClass("disabled")) return;
    server.verifySimp($("#newEntrySimp").val(), onSimpVerified);
    $("#acceptSimp").addClass("disabled");
  }

  // Callback when API finished checking simplified.
  // We show error notice, or move on to next field.
  function onSimpVerified(res) {
    $("#acceptSimp").removeClass("disabled");
    // Simplified is not OK - show error
    if (!res.passed) {
      $(".formErrors").removeClass("visible");
      $("#errorsSimp").addClass("visible");
      $("#noteSimp").addClass("hidden");
      $("#errorListSimp").empty();
      for (var i = 0; i < res.errors.length; ++i) {
        var liErr = $('<li/>');
        liErr.text(res.errors[i]);
        $("#errorListSimp").append(liErr);
      }
      $("#newEntrySimp").focus();
    }
    // We're good to go
    else {
      $("#errorsSimp").removeClass("visible");
      $("#noteSimp").removeClass("hidden");
      // If traditional, or even pinyin, are unambiguous: skip ahead one or two steps
      if (isTradUnambiguous()) {
        if (isPinyinUnambiguous()) {
          $("#editTrad").addClass("hidden");
          $("#editPinyin").addClass("hidden");
          // Instead of activating target, let's get headword verified
          onPinyinAccept();
        }
        else {
          $("#editPinyin").removeClass("hidden");
          $("#editTrad").addClass("hidden");
          setActive("pinyin");
        }
      }
      else {
        $("#editPinyin").removeClass("hidden");
        $("#editTrad").removeClass("hidden");
        setActive("trad");
      }
    }
  }

  // Checks if all traditional symbols are unambiguous (no user input needed).
  function isTradUnambiguous() {
    var unambiguous = true;
    var tctrl = $("#newEntryTradCtrl");
    tctrl.children().each(function () {
      if ($(this).children().length > 1) unambiguous = false;
    });
    return unambiguous;
  }

  // Checks if all pinyin syllables are unambiguous (no user input needed).
  function isPinyinUnambiguous() {
    var unambiguous = true;
    var tctrl = $("#newEntryPinyinCtrl");
    tctrl.children().each(function () {
      if ($(this).children().length > 1) unambiguous = false;
    });
    return unambiguous;
  }

  // Even handler: user clicked pencil to edit simplified field.
  function onSimpEdit(evt) {
    setActive("simp");
  }

  // Get user's choice of traditional HW.
  function getTrad() {
    var res = "";
    var tctrl = $("#newEntryTradCtrl");
    tctrl.children().each(function() {
      res += $(this).children().first().text();
    });
    return res;
  }

  // Get user's choice of pinyin in HW.
  function getPinyin() {
    var res = "";
    var tctrl = $("#newEntryPinyinCtrl");
    var first = true;
    tctrl.children().each(function () {
      if (!first) res += " ";
      first = false;
      res += $(this).children().first().text();
    });
    return res;
  }

  // Even handler: user clicked on a non-first-row traditional character to select it.
  function onTradAltClicked(evt) {
    if (!$("#blockTrad").hasClass("active")) return;

    var parent = $(this).parent();
    var tchars = [];
    tchars.push($(this).text());
    parent.children().each(function() {
      if ($(this).text() != tchars[0])
        tchars.push($(this).text());
    });
    parent.empty();
    for (var i = 0; i < tchars.length; ++i) {
      var tspan = $('<span />');
      if (i != 0) tspan.addClass("tradAlt");
      tspan.text(tchars[i]);
      parent.append(tspan);
    }
    $(".tradAlt").unbind("click", onTradAltClicked);
    $(".tradAlt").click(onTradAltClicked);

    server.processSimpTrad($("#newEntrySimp").val(), getTrad(), onSimpTradProcessed);
  }

  // Update data shown in pinyin field.
  function updatePinyin(pinyin) {
    $("#newEntryPinyinCtrl").empty();
    for (var i = 0; i != pinyin.length; ++i) {
      var ppos = $('<div class="newEntryPinyinPos"/>');
      for (var j = 0; j != pinyin[i].length; ++j) {
        var pspan = $('<span/>');
        if (j != 0) pspan.addClass("pyAlt");
        pspan.text(pinyin[i][j]);
        ppos.append(pspan);
      }
      $("#newEntryPinyinCtrl").append(ppos);
    }
    if (pinyin.length == 0) $("#newEntryPinyinCtrl").append('\xA0');
    $(".pyAlt").unbind("click", onPyAltClicked);
    $(".pyAlt").click(onPyAltClicked);
  }

  // Event handler: user clicked a pinyin alternative to select it.
  function onPyAltClicked(evt) {
    if (!$("#blockPinyin").hasClass("active")) return;

    var parent = $(this).parent();
    var tsylls = [];
    tsylls.push($(this).text());
    parent.children().each(function() {
      if ($(this).text() != tsylls[0])
        tsylls.push($(this).text());
    });
    parent.empty();
    for (var i = 0; i < tsylls.length; ++i) {
      var tspan = $('<span />');
      if (i != 0) tspan.addClass("pyAlt");
      tspan.text(tsylls[i]);
      parent.append(tspan);
    }
    $(".pyAlt").unbind("click", onPyAltClicked);
    $(".pyAlt").click(onPyAltClicked);
  }

  // API callback: server finished processing simplified+traditional.
  function onSimpTradProcessed(pinyin, known_hw) {
    updatePinyin(pinyin);
    if (known_hw) $(".newEntryKnown").addClass("visible");
    else $(".newEntryKnown").removeClass("visible");
  }

  return {
    init: function(id) {
      $(id).html(template);
    },
    setServer: function(srv) {
      server = srv;
    }
  }
})();

var zdNewEntryServer = (function() {
  return {
    processSimp: function(simp, ready) {
      // Query URL: localhost for sandboxing only
      var url = "/ApiHandler.ashx";
      if (window.location.protocol == "file:")
        url = "http://localhost:8000/ApiHandler.ashx";
      var req = $.ajax({
        url: url,
        type: "POST",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        data: {action: "newentry_processsimp", simp: simp}
      });
      req.done(function(data) {
        ready(data.trad, data.pinyin, data.is_known_headword);
      });
    },

    verifySimp: function(simp, ready) {
      // Query URL: localhost for sandboxing only
      var url = "/ApiHandler.ashx";
      if (window.location.protocol == "file:")
        url = "http://localhost:8000/ApiHandler.ashx";
      var req = $.ajax({
        url: url,
        type: "POST",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        data: { action: "newentry_verifysimp", simp: simp }
      });
      req.done(function (data) {
        var res = {
          passed: data.passed,
          errors: data.errors
        };
        ready(res);
      });
    },

    verifyHead: function(simp, trad, pinyin, ready) {
      // Query URL: localhost for sandboxing only
      var url = "/ApiHandler.ashx";
      if (window.location.protocol == "file:")
        url = "http://localhost:8000/ApiHandler.ashx";
      var req = $.ajax({
        url: url,
        type: "POST",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        data: { action: "newentry_verifyhead", simp: simp, trad: trad, pinyin: pinyin }
      });
      req.done(function (data) {
        var res = {
          passed: data.passed,
          ref_entries_html: data.ref_entries_html,
        };
        ready(res);
      });
    },

    verifyTrg: function(simp, trad, pinyin, trg, ready) {
      // Query URL: localhost for sandboxing only
      var url = "/ApiHandler.ashx";
      if (window.location.protocol == "file:")
        url = "http://localhost:8000/ApiHandler.ashx";
      var req = $.ajax({
        url: url,
        type: "POST",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        data: { action: "newentry_verifyfull", simp: simp, trad: trad, pinyin: pinyin, trg: trg }
      });
      req.done(function (data) {
        var res = {
          passed: data.passed,
          errors: data.errors,
          preview: data.preview_html
        };
        ready(res);
      });
    },

    processSimpTrad: function(simp, trad, ready) {
      // Query URL: localhost for sandboxing only
      var url = "/ApiHandler.ashx";
      if (window.location.protocol == "file:")
        url = "http://localhost:8000/ApiHandler.ashx";
      var req = $.ajax({
        url: url,
        type: "POST",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        data: { action: "newentry_processsimptrad", simp: simp, trad: trad }
      });
      req.done(function (data) {
        ready(data.pinyin, data.is_known_headword);
      });
    }
  }
})();


zdNewEntry.init("#newEntry");
zdNewEntry.setServer(zdNewEntryServer);
//zdNewEntry.setServer(zdNewEntryShim);