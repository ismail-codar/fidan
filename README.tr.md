# Fidan Javascript Arayüz Kütüphanesi

Web arayüzü geliştirmek için kullanımı kolay ve hızlı bir yol.

## Özellikler

- 4 kb dan daha küçük
- "Reactive Programming" tabanlı
  > Oldukça küçük ve hızlı kendi iç reaktif programlama altyapısı yanında [RxJS](https://www.learnrxjs.io/) benzeri diğer kütüphaneler ile de entegre çalışabilir.
- Popüler javascript kütüphanelerinden çok daha kolay ve daha hızlı

  > Çünkü bir virtual dom kütüphanesi değil her state değiştiğinde virtual dom ağacını kontrol etmeye ihtiyacı yok. Virtual dom ağacını hızlı kontrol edebilmek içinde [shouldComponentUpdate](https://reactjs.org/docs/react-component.html#shouldcomponentupdate) optimizasyonuna, [immutable](https://immutable-js.github.io/immutable-js/) yapıların kullanılmasına ya da [useMemo](https://reactjs.org/docs/hooks-reference.html#usememo) benzeri diğer optimizasyonlara da ihtiyacı yok.

  > Arayüzde değişmesi gereken yerleri html template üzerinden yola çıkarak kendisi bilir ve reaktif olarak değiştirir.

- Template compiler doğrudan DOM nesneleri döndürür.

  > Bu sayede daha fazla özelleştirilebilir ve diğer kütüphanelerle daha iyi entegrasyon sağlanabilir.

  ```js
  var element = html`
    <div>bu gerçek bir DOM nesnesidir</div>
  `;
  document.body.appendChild(element);
  ```

- Kolay, basit anlaşılır API.
  > Çünkü reaktif değişkenleri oluşturmak, klasik html sözdizimine sahip bir şablon üzerine bu değişkenleri koymak ve kodunuzun içinde bu değişkenlerin değerini değiştirerek arayüzün güncellendiğini seyretmek dışında birşeye ihtiyacınız yok.

## Neden yeni bir kütüphane?

Dünya genelinde yaygın kullanılan React, Vue, Angular gibi kütüphaneleri herkes biliyor. Ancak sürekli [benchmarklarda](https://krausest.github.io/js-framework-benchmark/current.html) kendini sınayan yeni bir framework sendromu da vardır. Elbette ki bunların amacı **tekerleği yeniden icat etmek değildir**. Belki mevcut tekerleklerin sıkıntılı olmasındandır.

### React mı, Vue mi, Angular mı?

En çok sorulan, cevabı aranan bir soruya hoş geldiniz. Kişisel olarak kısa, kesin ve net cevabım virtual dom kütüphanelerinin **hiçbirisi** şeklindedir. (kariyer için öğrenmek ve kullanmak hariç)

Virtual dom bir şeylere çözüm olurken başka problemlere sebep olmaktadır. Bunlardan kaçınmak içinde kendinizi **sonsuz bir öğrenme döngüsü** içinde bulursunuz. React bir şaka mı başlıklı [bu tartışmaya](https://news.ycombinator.com/item?id=15052555) ya da [buraya](https://games.greggman.com/game/react-and-redux-are-a-joke-right) gözatabilirsiniz.

Bu konu ayrıca birkaç blog yazısı ile anlatılabilecek kadar uzundur.
Şimdilik tıpkı fidanjs gibi virtual dom konsepti dışında hareket eden [svelte kütüphanesinin blog yazısını](https://svelte.dev/blog/virtual-dom-is-pure-overhead) tavsiye edebilirim.

#### Yaygın frameworkler ve çözüm arayışları

- Bugün virtual dom tekniğinin mucidi React virtual dom ağacını daha efektif güncelleyebilmek için Fiber adını verdiği bir altyapıya geçerken v16 ile baştan yazıldı. Son olarak yeni çıkan hook API si ile çok sıkıntı çekilen "state management" konusunu basitleştirmeye çalışıyor.
- AngularJs zamanlarında virtual dom kütüphanesi değilken Angular adıyla ama tamamen farklı bir framework ortaya çıktı. Geliştiriciler açısından React gibi state yönetimi konusunda sıkıntılı değil ancak gereksiz komplex modül yapısına ve öğrenmesi zaman alıp kullanması da zor olan bir "template syntax" ına sahip.
- Vue ise eski bir Angular geliştiricisi tarafından Angular konseptinin avantajlarına sahip olup dezavantajlarını azaltmak amacıyla yola çıktı ve çok da sevildi. Bu gün ise hook API si ile bir atak yapan React in hook API si benzeri üzerinden devam etmeyi amaçlıyor.

# FidanJS nasıl bir çözüm olabiliyor?

Virtual dom tekniğini kulllanılmıyor ise state üzerinde değişiklik olduğunda arayüz nasıl efektif olarak yeniden oluşturuluyor? Yoksa eski zamanlarda olduğu gibi her seferinde baştan mı oluşturuluyor! Ya da [vanillajs](http://vanilla-js.com/) yaklaşımı ile her şeyi web geliştiricisi manuel olarak mı yönetiyor?

FidanJS diğer alternatifleri olan [svelte](https://svelte.dev/), [solid](https://github.com/ryansolid/solid), [surplus](https://github.com/adamhaile/surplus) benzer bir yaklaşım kullanmaktadır.

Buna göre:

- Tanımlanan "functional reactive" değişkenlere bir template (html) üzerinde kodlanır.
- Template compiler aracılığı ile kullanıldıkları yerlerdeki arayüz parçasını güncelleme görevi olan yeni reaktif fonksiyonlar bağlanılır.
- Gerektiği zaman da bu değişkenler üzerindeki veri güncellenir. Bu arayüzü güncelleme görevi olan fonksiyonlardan sadece gerekli olanları tetiklenerek sadece gerekli olan arayüz parçacığı güncellenmiş olur.

## Örnekler üzerinden gidecek olursak:

```js
import { value, compute, html } from "@fidanjs/runtime";

var A = value(1); // A adında reaktif bir değişkenin değeri 1
var B = value(2); // B adında reaktif bir değişkenin değeri 2
var C = compute(() => A() + B()); // C değişkeni ise A ve B nin toplamını döndürür

/* Aşağıda javascript in template literal özelliği kullanılarak 
kodlanmış bir html template vardır. 

oninput event leri ile A ve B nin değeri değiştirildiğinde C 
değişkeninin blunduğu text bölgesi fidanjs runtime i tarafından 
otomatik olarak arayüz üzerinde değiştirilmektedir.
*/
var view = html`
  <div>
    A:
    <input
      type="number"
      value="${A}"
      oninput="${e => A(parseInt(e.target.value))}"
    />
    <br />
    B:
    <input
      type="number"
      value="${B}"
      oninput="${e => B(parseInt(e.target.value))}"
    />
    <br />
    C: ${C}
  </div>
`;

document.body.appendChild(view);
```

Bu örneğin çalışır haline [buradan](https://codesandbox.io/s/github/ismail-codar/fidan-html-examples/tree/master/?fontsize=14&initialpath=%2Fexamples%2Fbasic%2Fsum%2Findex.html&module=%2Fexamples%2Fbasic%2Fsum%2Fapp.ts) erişebilirsiniz.

### Örnek biraz çirkin mi gözüküyor?
Evet burada `A = value(1)` şeklinde A değişkeni, oluşturmak, sonra değerini almak için `A()` kullanmak, değer atamak istediğinizde de `A(2)` şeklinde kullanmak biraz çirkin gözüküyor olabilir.

Ancak alternatif bir kullanım şekli ile daha temiz görünümde kod elde edilebilir.
Bunun için `inject` metodu ile bir objenin property lerinin reaktif değişkenler haline getirildiği mouse pozisyonunu sayfa üzerinde gösterme [örneğimize buradan](https://codesandbox.io/s/github/ismail-codar/fidan-html-examples/tree/master/?fontsize=14&initialpath=%2Fexamples%2Fbasic%2Fmouse-position%2Findex.html&module=%2Fexamples%2Fbasic%2Fmouse-position%2Fapp.ts) göz atabilirsiniz.

```js
import { inject, html } from "@fidanjs/runtime";

const mousePosition = inject({ x: 0, y: 0 });

const app = html`
  <div style="width:100%; height:1000px">
    x: ${mousePosition.x}, y:${mousePosition.y}
  </div>
`;

document.body.addEventListener("mousemove", e => {
  mousePosition.x = e.clientX;
  mousePosition.y = e.clientY;
});

document.getElementById("main").appendChild(app);
```

## .... Örnekler ve API dökümantasyonu devam edecek....

- Tüm örnekler: https://codesandbox.io/s/github/ismail-codar/fidan-html-examples
- TodoMVC Örneği: https://github.com/ismail-codar/cypress-example-todomvc/blob/master/src/minimal/index.ts
