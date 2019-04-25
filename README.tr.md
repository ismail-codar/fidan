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
  > Çünkü reaktif değişkenleri oluşturmak, html sözdizimine sahip şablon üzerinde kullanmak ve kodunuzun içinde reaktif değişkenleri değiştirerek arayüzün güncellendiğini seyretmek dışında birşeye ihtiyacınız yok.

## Neden yeni bir kütüphane?

Dünya genelinde sürekli yaygın kullanılan React, Vue, Angular gibi kütüphaneleri herkes biliyor. Ancak sürekli [benchmarklarda](https://krausest.github.io/js-framework-benchmark/current.html) kendini sınayan yeni bir framework sendromu da vardır. Elbette ki bunların amacı **tekerleği yeniden icat etmek değildir**. Belki mevcut tekerleklerin sıkıntılı olmasındandır.

### React mı, Vue mi, Angular mı?

En çok sorulan, cevabı aranan bir soruya hoş geldiniz. Kişisel olarak kısa, kesin ve net cevabım virtual dom kütüphanelerinin **hiçbirisi** şeklindedir. (kariyer için öğrenmek ve kullanmak hariç)

Virtual dom bir şeylere çözüm olurken başka problemlere sebep olmaktadır. Bunlardan kaçınmak içinde kendinizi **sonsuz bir öğrenme döngüsü** içinde bulursunuz. React bir şaka mı başlıklı [bu tartışmaya](https://news.ycombinator.com/item?id=15052555) ya da [buraya](https://games.greggman.com/game/react-and-redux-are-a-joke-right) gözatabilirsiniz.

Bu ayrıca birkaç blog yazısı ile anlatılabilecek kadar çok uzun bir konudur.
Şimdilik tıpkı fidanjs gibi virtual dom konsepti dışında hareket eden [svelte kütüphanesinin blog yazısını](https://svelte.dev/blog/virtual-dom-is-pure-overhead) okuyabilirsiniz.

#### Yaygın frameworkler ve çözüm arayışları

- Bugün virtual dom tekniğinin mucidi React virtual dom ağacını daha efektif güncelleyebilmek için Fiber adını verdiği bir altyapıya geçerken v16 ile baştan yazıldı. Son olarak yeni çıkan hook API si ile çok sıkıntı çekilen "state management" konusunu basitleştirmeye çalışıyor.
- AngularJs zamanlarında virtual dom kütüphanesi değilken Angular adıyla ama tamamen farklı bir framework ortaya çıktı. Geliştiriciler açısından React gibi state yönetimi konusunda sıkıntılı değil ancak gereksiz komplex modül yapısına ve öğrenmesi zaman alıp kullanması da zor olan bir "template syntax" ına sahip.
- Vue ise eski bir Angular geliştiricisi tarafından Angular konseptinin avantajlarına sahip olup dezavantajlarını azaltmak amacıyla yola çıktı ve çok da sevildi. Bu gün ise hook API si ile bir atak yapan React in hook API si benzeri üzerinden devam etmeyi amaçlıyor.

# FidanJS nasıl bir çözüm olabiliyor?

**Soru:** Virtual dom tekniğini kulllanılmıyor ise state üzerinde değişiklik olduğunda arayüz nasıl efektif olarak yeniden oluşturuluyor? Yoksa eski zamanlarda olduğu gibi her seferinde baştan mı oluşturuluyor! Ya da [vanillajs](http://vanilla-js.com/) yaklaşımı ile her şeyi web geliştiricisi manuel olarak mı yönetiyor?

**Cevap:** Kendisi ile aynı yaklaşıma sahip diğer alternatifleri olan [svelte](https://svelte.dev/), [solid](https://github.com/ryansolid/solid), [surplus](https://github.com/adamhaile/surplus) gibi "Functional Reactive Programming" yaklaşımını kullanmaktadır.

Buna göre:

- Tanımlanan "functional reactive" değişkenlere bir template (html) üzerinde kodlanır.
- Template compiler aracılığı ile kullanıldıkları yerlerdeki arayüz parçasını güncelleme görevi olan yeni reaktif fonksiyonlar bağlanılır.
- Gerektiği zaman da bu değişkenler üzerindeki veri güncellenir. Bu arayüzü güncelleme görevi olan fonksiyonlardan sadece gerekli olanları tetiklenerek sadece gerekli olan arayüz parçacığı güncellenmiş olur.
