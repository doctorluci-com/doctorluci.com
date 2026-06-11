const fs = require('fs');
const path = require('path');

const localesDir = path.join('/var/www/doctorluci.com', 'src', 'i18n', 'locales');
const files = ['ro.json', 'en.json', 'ru.json', 'es.json'];

const newReview = {
  ro: {
    name: "Tatiana Ț.",
    text: "Bună ziua d.Lucia! Am fost la masajul terapeutic la Natalia. Am rugato în timpul masajului să vorbeasca cu mine și a fost foarte plăcută procedura și toată discuția care am avuto cu ea. De fiecare dată mă conving că fiecare pas pe care îl urmez de fiecare dată pe care dumneavoastre mă gidați este pentru mine o plăcere enormă! La d.Anatol am fost cu baiatul mai mare la fel am ramas foarte mulțumită. Mă mîndresc că vă am alături de aproape de sufletul meu. Vă iubim mai ales eu și Nicolas mereu îi amintesc de dumneavoastre și vin cu exemple că dacă vrem să fim sănătoși trebuie să fim atenți la ce mîncăm și el și abține de la unele pofteși îmi spune bine! Vă doresc să aveți mereu doar îmliniri frumoase sunteți deosebită un Soare care mă încalziți mereu cu blîndețe.",
    source: "WhatsApp",
    date: "10.06.2026"
  },
  en: {
    name: "Tatiana Ț.",
    text: "Hello Dr. Lucia! I went for a therapeutic massage with Natalia. I asked her to talk to me during the massage and the procedure and all the discussion we had was very pleasant. Every time I am convinced that every step I follow every time you guide me is an enormous pleasure for me! I went to Dr. Anatol with my older boy and I was also very satisfied. I am proud to have you close to my soul. We love you, especially Nicolas and I, I always remind him of you and give examples that if we want to be healthy we must be careful what we eat and he refrains from some cravings and tells me well! I wish you always only beautiful achievements, you are special, a Sun that always warms me with gentleness.",
    source: "WhatsApp",
    date: "10.06.2026"
  },
  ru: {
    name: "Tatiana Ț.",
    text: "Здравствуйте, доктор Лучия! Я была на лечебном массаже у Наталии. Я попросила ее поговорить со мной во время массажа, и процедура, и вся наша беседа были очень приятными. Каждый раз убеждаюсь, что каждый шаг, который я делаю под вашим руководством, доставляет мне огромное удовольствие! Я ходила к доктору Анатолу со старшим мальчиком и тоже осталась очень довольна. Я горжусь тем, что вы так близки моему сердцу. Мы вас любим, особенно я и Николя, я всегда напоминаю ему о вас и привожу в пример, что если мы хотим быть здоровыми, мы должны следить за тем, что едим, и он воздерживается от некоторых желаний и говорит мне «хорошо»! Желаю вам всегда только прекрасных свершений, вы особенная, Солнце, которое всегда согревает меня своей нежностью.",
    source: "WhatsApp",
    date: "10.06.2026"
  },
  es: {
    name: "Tatiana Ț.",
    text: "¡Hola Dra. Lucia! Fui a un masaje terapéutico con Natalia. Le pedí que hablara conmigo durante el masaje y el procedimiento y toda la discusión que tuvimos fue muy agradable. ¡Cada vez estoy más convencida de que cada paso que sigo cada vez que me guía es un placer enorme para mí! Fui al Dr. Anatol con mi hijo mayor y también quedé muy satisfecha. Estoy orgullosa de tenerla cerca de mi alma. ¡La amamos, especialmente Nicolas y yo, siempre le recuerdo a usted y le doy ejemplos de que si queremos estar sanos debemos tener cuidado con lo que comemos y él se abstiene de algunos antojos y me dice bien! Le deseo siempre solo hermosos logros, es especial, un Sol que siempre me calienta con gentileza.",
    source: "WhatsApp",
    date: "10.06.2026"
  }
};

for (const file of files) {
  const filePath = path.join(localesDir, file);
  if (fs.existsSync(filePath)) {
    const lang = file.split('.')[0];
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // update testimonials
    if (data.testimonials && data.testimonials.items) {
      data.testimonials.items.push(newReview[lang]);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Updated ${file}`);
    }
  }
}
