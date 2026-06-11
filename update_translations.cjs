const fs = require('fs');
const path = require('path');

const localesDir = path.join('/var/www/doctorluci.com', 'src', 'i18n', 'locales');
const files = ['ro.json', 'en.json', 'ru.json', 'es.json'];

const testimonials = {
  ro: {
    title: "Feedback",
    titleItalic: "clienților",
    subtitle: "Descoperă ce apreciază pacienții mei la noi",
    items: [
      {
        name: "Irina Păduraru",
        text: "Doresc să vă mulțumesc din suflet pentru suportul și îndrumarea oferite în gestionarea problemelor respiratorii ale băiatului meu. Datorită recomandărilor și atenției dumneavoastră, această primăvară a fost cu adevărat diferită pentru el. Spre deosebire de anii precedenți, nu a mai avut reacțiile alergice severe care îi afectau starea de bine și activitățile zilnice. A reușit să respire ușor, fără mâncărimi ale ochilor, nasului și fără alte manifestări specifice alergiilor.",
        source: "WhatsApp",
        date: "14.05.2026"
      },
      {
        name: "Diana Munteanu",
        text: "Cu ajutorul dumneavoastră am reușit să identificăm cauza acestor reacții și să îi oferim sprijinul necesar pentru o dezvoltare armonioasă, fără a interveni inutil în procesele firești ale organismului său. Vă suntem profund recunoscători pentru profesionalismul, dedicarea și grija cu care ne-ați însoțit pe acest parcurs. Vă mulțumim din inimă!",
        source: "WhatsApp",
        date: "02.06.2026"
      },
      {
        name: "Corina V.",
        text: "Exact aşa blinele îi făceam unui băiețel bolnav de autism cît îi eram bonă. Asta pînă a sta cu Leo. Datorită faptului că s-a exclus lactatea, glutenul și zahărul copilul încet a început să fie mai bine.",
        source: "WhatsApp",
        date: "28.05.2026"
      },
      {
        name: "Simona R.",
        text: "Vreau sa revin la dvs cu o profunda recunoștință fata de dvs referitor la ajutorul acordat și încrederea în mine care ați avut-o ca o pot ajuta pe Adela cu adenoizii și nu m-ați trimis sa-i scot. În timp de un an de la 85% a ajuns la 70%. Calea spre vindecare este lunga dar știu ce am de făcut. Sfaturile dvs sunt magice( permiteți-mi sa le spun asa). Aveți grija de dvs pentru ca noi avem nevoie de asa medic ca dvs",
        source: "WhatsApp",
        date: "11.06.2026"
      },
      {
        name: "Andreea C.",
        text: "Va Multumesc! Întâlnirea de aseară a fost tare faina. Continuaţi, prea multe femei va simt la fel cum și eu - asta spune ceva despre Dvs. și poate și despre menirea Dvs aici.",
        source: "WhatsApp",
        date: "09.06.2026"
      },
      {
        name: "Natalia S.",
        text: "D. Lucia vă mulțumesc sincer pentru dedicarea și profesionalismul cu care ați avut grijă de sănătatea copilașului nostru și a mea! Sunteți un medic extraordinar, iar eu vă voi fi mereu profund recunoscătoare pentru sprijinul oferit! Vă iubim vă dorim o zi minutată plină de momente și surprize placute!",
        source: "WhatsApp",
        date: "21.05.2026"
      },
      {
        name: "Valentina D.",
        text: "Doamna Lucia, buna ziua! Noi mai avem o fetita cea mare se simte foarte bine, noaptea cand respira uneori ne punem sa ascultam nu se aude deloc.. dar asta mica are urechiusele un pic diferite.. puteti sa-mi spuneti va rog daca ati mai intilnit asa?",
        source: "WhatsApp",
        date: "10.06.2026"
      },
      {
        name: "Mihaela L.",
        text: "Bună ziua! Am vrut să vă mulțumesc din inimă pentru felul în care m-ați ghidat și încurajat! Pe tot parcursul răcelii eram atât de calmă, deși uneori îmi apărea și frica. Mulțumesc pentru sfaturile valoroase! Urmând pașii d-voastră, după 4 zile de chin respir fără niciun spray și sunt atât de mândră că am folosit doar produse naturiste și totul a trecut în mai puțin de o săptămână.",
        source: "WhatsApp",
        date: "05.06.2026"
      }
    ]
  },
  en: {
    title: "Client",
    titleItalic: "feedback",
    subtitle: "Discover what my patients appreciate about us",
    items: [
      {
        name: "Irina Păduraru",
        text: "I want to thank you from the bottom of my heart for the support and guidance provided in managing my boy's respiratory problems. Thanks to your recommendations, this spring was truly different for him. He managed to breathe easily, without itchy eyes or nose.",
        source: "WhatsApp",
        date: "14.05.2026"
      },
      {
        name: "Diana Munteanu",
        text: "With your help we managed to identify the cause of these reactions and offer him the necessary support for harmonious development, without intervening unnecessarily in his body's natural processes. We are deeply grateful for your professionalism and care.",
        source: "WhatsApp",
        date: "02.06.2026"
      },
      {
        name: "Corina V.",
        text: "That's exactly how I used to make pancakes for an autistic boy when I was his nanny. Thanks to excluding dairy, gluten and sugar, the child slowly started getting better.",
        source: "WhatsApp",
        date: "28.05.2026"
      },
      {
        name: "Simona R.",
        text: "I want to return to you with profound gratitude regarding the help provided and the trust you had that I can help Adela with her adenoids without removing them. Your advice is magic. Take care of yourself because we need doctors like you.",
        source: "WhatsApp",
        date: "11.06.2026"
      },
      {
        name: "Andreea C.",
        text: "Thank you! Last night's meeting was very nice. Keep going, too many women feel you just like I do - that says something about you and maybe your purpose here.",
        source: "WhatsApp",
        date: "09.06.2026"
      },
      {
        name: "Natalia S.",
        text: "Dr. Lucia, I sincerely thank you for the dedication and professionalism with which you took care of our child's health and mine! You are an extraordinary doctor, and I will always be deeply grateful for your support!",
        source: "WhatsApp",
        date: "21.05.2026"
      },
      {
        name: "Valentina D.",
        text: "Hello Dr. Lucia! Our older girl feels very well, when she breathes at night we sometimes listen and you can't hear anything.. but the little one has slightly different ears.. can you tell me if you've encountered this before?",
        source: "WhatsApp",
        date: "10.06.2026"
      },
      {
        name: "Mihaela L.",
        text: "Hello! I wanted to thank you from the bottom of my heart for how you guided and encouraged me! Following your steps, after 4 days of agony I breathe without any spray and I'm so proud I used only natural products.",
        source: "WhatsApp",
        date: "05.06.2026"
      }
    ]
  },
  ru: {
    title: "Отзывы",
    titleItalic: "клиентов",
    subtitle: "Узнайте, что наши пациенты ценят в нас",
    items: [
      {
        name: "Irina Păduraru",
        text: "Хочу от всего сердца поблагодарить вас за поддержку и руководство в лечении респираторных проблем моего мальчика. Благодаря вашим рекомендациям эта весна была для него совсем другой. Он смог дышать легко, без зуда в глазах и носу.",
        source: "WhatsApp",
        date: "14.05.2026"
      },
      {
        name: "Diana Munteanu",
        text: "С вашей помощью нам удалось выявить причину этих реакций и оказать ему необходимую поддержку для гармоничного развития. Мы глубоко признательны за ваш профессионализм, преданность делу и заботу.",
        source: "WhatsApp",
        date: "02.06.2026"
      },
      {
        name: "Corina V.",
        text: "Именно так я готовила блинчики для мальчика с аутизмом, когда была его няней. Благодаря исключению молочных продуктов, глютена и сахара, ребенку постепенно стало лучше.",
        source: "WhatsApp",
        date: "28.05.2026"
      },
      {
        name: "Simona R.",
        text: "Я хочу вернуться к вам с глубокой благодарностью за оказанную помощь и доверие. Ваши советы просто волшебны. Берегите себя, потому что нам нужны такие врачи, как вы.",
        source: "WhatsApp",
        date: "11.06.2026"
      },
      {
        name: "Andreea C.",
        text: "Спасибо! Вчерашняя встреча была очень приятной. Продолжайте в том же духе, слишком многие женщины чувствуют вас так же, как и я.",
        source: "WhatsApp",
        date: "09.06.2026"
      },
      {
        name: "Natalia S.",
        text: "Доктор Лучия, я искренне благодарю вас за преданность делу и профессионализм, с которым вы заботились о здоровье нашего ребенка и моем! Вы необыкновенный врач!",
        source: "WhatsApp",
        date: "21.05.2026"
      },
      {
        name: "Valentina D.",
        text: "Здравствуйте, доктор Лучия! Наша старшая девочка чувствует себя очень хорошо. Но у младшей немного другие ушки.. подскажите, пожалуйста, вы с таким уже сталкивались?",
        source: "WhatsApp",
        date: "10.06.2026"
      },
      {
        name: "Mihaela L.",
        text: "Здравствуйте! Хотела от всей души поблагодарить вас за то, как вы меня направляли и подбадривали! Следуя вашим шагам, после 4 дней мучений я дышу без всякого спрея и очень горжусь тем, что использовала только натуральные продукты.",
        source: "WhatsApp",
        date: "05.06.2026"
      }
    ]
  },
  es: {
    title: "Comentarios",
    titleItalic: "de los clientes",
    subtitle: "Descubre lo que nuestros pacientes aprecian de nosotros",
    items: [
      {
        name: "Irina Păduraru",
        text: "Quiero agradecerle de todo corazón por el apoyo y la orientación brindada en el manejo de los problemas respiratorios de mi niño. Gracias a sus recomendaciones, esta primavera fue realmente diferente para él. Logró respirar con facilidad, sin picazón en los ojos ni en la nariz.",
        source: "WhatsApp",
        date: "14.05.2026"
      },
      {
        name: "Diana Munteanu",
        text: "Con su ayuda logramos identificar la causa de estas reacciones y ofrecerle el apoyo necesario para un desarrollo armonioso. Estamos profundamente agradecidos por su profesionalismo, dedicación y cuidado.",
        source: "WhatsApp",
        date: "02.06.2026"
      },
      {
        name: "Corina V.",
        text: "Exactamente así le hacía panqueques a un niño autista cuando era su niñera. Gracias a la exclusión de lácteos, gluten y azúcar, el niño empezó a mejorar lentamente.",
        source: "WhatsApp",
        date: "28.05.2026"
      },
      {
        name: "Simona R.",
        text: "Quiero volver a usted con profunda gratitud por la ayuda brindada y la confianza. Sus consejos son mágicos. Cuídese porque necesitamos médicos como usted.",
        source: "WhatsApp",
        date: "11.06.2026"
      },
      {
        name: "Andreea C.",
        text: "¡Gracias! La reunión de anoche fue muy agradable. Siga adelante, muchas mujeres la sienten igual que yo.",
        source: "WhatsApp",
        date: "09.06.2026"
      },
      {
        name: "Natalia S.",
        text: "¡Dra. Lucia, le agradezco sinceramente la dedicación y profesionalidad con la que cuidó la salud de nuestro hijo y la mía! ¡Es una médica extraordinaria!",
        source: "WhatsApp",
        date: "21.05.2026"
      },
      {
        name: "Valentina D.",
        text: "¡Hola Dra. Lucia! Nuestra niña mayor se siente muy bien, por la noche cuando respira a veces escuchamos y no se oye nada... pero la pequeña tiene las orejitas un poco diferentes.. ¿me puede decir si se ha encontrado con esto antes?",
        source: "WhatsApp",
        date: "10.06.2026"
      },
      {
        name: "Mihaela L.",
        text: "¡Hola! ¡Quería agradecerle de todo corazón por cómo me guió y animó! Siguiendo sus pasos, después de 4 días de agonía respiro sin ningún spray y estoy muy orgullosa de haber usado solo productos naturales.",
        source: "WhatsApp",
        date: "05.06.2026"
      }
    ]
  }
};

for (const file of files) {
  const filePath = path.join(localesDir, file);
  if (fs.existsSync(filePath)) {
    const lang = file.split('.')[0];
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // update testimonials
    data.testimonials = testimonials[lang];

    // also for backwards compat or any other usage
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${file}`);
  }
}
