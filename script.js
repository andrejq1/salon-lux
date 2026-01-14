// Čekamo da se DOM učita
document.addEventListener("DOMContentLoaded", () => {

  // SMOOTH SCROLL
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e){
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if(target){
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ELEMENTI
  const frizerkaSelect = document.getElementById("frizerka");
  const danSelect = document.getElementById("dan");
  const terminSelect = document.getElementById("termin");
  const bookingForm = document.getElementById("bookingForm");

  // UCITAVANJE ZAUZETIH TERMINA
  let booked = JSON.parse(localStorage.getItem("booked")) || {};

  // OČISTI STARE DATUME
  const todayStr = new Date().toISOString().split("T")[0];
  for (let day in booked) if (day < todayStr) delete booked[day];
  localStorage.setItem("booked", JSON.stringify(booked));

  function sendMail(){
    let parms = {
      ime : document.getElementById("ime").value,
      prezime : document.getElementById("prezime").value,
      email : document.getElementById("email").value,
      telefon : document.getElementById("telefon").value,
      termin : document.getElementById("termin").value,
      frizerka: document.getElementById("frizerka").value,
       usluga: document.getElementById("usluga").value,
    } 

    emailjs.send("service_jvg68bf","template_o4trruo",parms).then(alert("Email Sent!"))
  }

  // FUNKCIJA ZA SLEDEĆIH 6 RADNIH DANA
  function getNextWorkDays(count = 6){
    const days = [];
    let date = new Date();
    while(days.length < count){
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const dayOfWeek = nextDate.getDay(); // 0-Ned, 6-Sub
      if(dayOfWeek >= 1 && dayOfWeek <=5){ // Ponedeljak-Petak
        days.push(nextDate);
      }
      date.setDate(date.getDate() + 1);
    }
    return days;
  }

  // POPUNI DANE
  function populateDays(){
    danSelect.innerHTML = '<option value="">Izaberite dan</option>';
    getNextWorkDays().forEach(date=>{
      const options = {weekday:'long', day:'numeric', month:'numeric'};
      const display = date.toLocaleDateString('sr-RS', options);
      const value = date.toISOString().split("T")[0];
      const option = document.createElement("option");
      option.value = value;
      option.textContent = display.charAt(0).toUpperCase() + display.slice(1);
      danSelect.appendChild(option);
    });
  }

  // POPUNI TERMIN
  function populateTermin(){
    terminSelect.innerHTML = '<option value="">Izaberite termin</option>';
    const frizerka = frizerkaSelect.value;
    const dan = danSelect.value;
    if(!frizerka || !dan) return;

    // Definicija radnog vremena
    let startHour = frizerka==='ana'?12:8;
    let endHour = frizerka==='ana'?20:16;

    for(let h=startHour; h<endHour; h++){
      for(let m of [0,45]){
        const hh = h.toString().padStart(2,'0');
        const mm = m.toString().padStart(2,'0');
        const timeStr = `${hh}:${mm}`;
        if(booked[dan]?.includes(timeStr)) continue; // preskoči zauzeto
        const option = document.createElement("option");
        option.value = timeStr;
        option.textContent = timeStr;
        terminSelect.appendChild(option);
      }
    }
  }

  // POPUNI DANE PRI UČITAVANJU
  populateDays();

  // EVENT LISTENERI
  frizerkaSelect.addEventListener("change", populateTermin);
  danSelect.addEventListener("change", populateTermin);

  // ZAKAZIVANJE
  bookingForm.addEventListener("submit", function(e){
    e.preventDefault();

    const data = {
      ime: document.getElementById("ime").value.trim(),
      prezime: document.getElementById("prezime").value.trim(),
      telefon: document.getElementById("telefon").value.trim(),
      email: document.getElementById("email").value.trim(),
      frizerka: frizerkaSelect.value,
      dan: danSelect.value,
      termin: terminSelect.value,
      usluga: document.getElementById("usluga").value
    };

    // VALIDACIJA
    if(!data.ime || !data.prezime || !data.telefon || !data.email || !data.frizerka || !data.dan || !data.termin || !data.usluga){
      alert("Molimo popunite sva polja!"); return;
    }
    if(!/^\d{6,}$/.test(data.telefon)){alert("Telefon mora imati najmanje 6 cifara."); return;}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)){alert("Unesite validan email."); return;}

    // DODAJ TERMIN U LOCALSTORAGE
    if(!booked[data.dan]) booked[data.dan] = [];
    booked[data.dan].push(data.termin);
    localStorage.setItem("booked", JSON.stringify(booked));

    // MAILTO ZA OTPIS TERMINA
    const mailTo = `mailto:salonlux@example.com?subject=Otkaži termin&body=Želim da otkažem termin na ${data.dan} u ${data.termin} za ${data.ime} ${data.prezime}.`;

    // ALERT USPESNO
    alert(`Termin uspešno zakazan!\nFrizerka: ${data.frizerka}\nDan: ${data.dan}\nTermin: ${data.termin}\nUsluga: ${data.usluga}\nDa otkažete termin, koristite email: salonlux@example.com`);

    // RESET FORME
    bookingForm.reset();
    populateDays();
    terminSelect.innerHTML = '<option value="">Izaberite termin</option>';
  });
});