/* White Matter — shared point economy for the Life OS.
   One localStorage blob both the Fortnight tab and the Penultimate console read/write.
   earned = adherence (daily blocks) + quest steps (5 each) + milestone bonuses.
   balance = earned - spent (rewards). */
(function (g) {
  var KEY = 'wmState';
  function load(){ try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e){ return {}; } }
  function store(s){ try { localStorage.setItem(KEY, JSON.stringify(s)); } catch(e){} }
  function norm(s){ s = s || {}; s.adherence = s.adherence || {}; s.spent = +s.spent || 0;
    s.quests = s.quests || {}; s.milestones = s.milestones || {}; return s; }
  function sum(o){ var t = 0; for (var k in o) t += (+o[k] || 0); return t; }
  function qEarned(s){ var t = 0, q, a, i; for (q in s.quests){ a = s.quests[q] || []; for (i=0;i<a.length;i++) if (a[i]) t += WM.STEP; } return t; }
  var WM = {
    STEP: 5, FULLDAY_BONUS: 3,
    get: function(){ return norm(load()); },
    save: function(s){ store(norm(s)); },
    earned: function(s){ s = s ? norm(s) : norm(load()); return sum(s.adherence) + qEarned(s) + sum(s.milestones); },
    balance: function(s){ s = s ? norm(s) : norm(load()); return WM.earned(s) - s.spent; },
    setDay: function(date, amt){ var s = norm(load()); s.adherence[date] = amt; store(s); return s; },
    spend: function(cost){ var s = norm(load()); if (WM.balance(s) >= cost){ s.spent += cost; store(s); return true; } return false; }
  };
  g.WM = WM;
})(window);
