// Сначала получаем необходимые DOM-элементы
const __DOCUMENT__       = document,
__TABLE__                = __DOCUMENT__.querySelector('table tbody'),
__TH_ARR__               = __DOCUMENT__.querySelectorAll('table th'),
__BACK_BUTTON__          = __DOCUMENT__.querySelector('button#back'),
__NEXT_BUTTON__          = __DOCUMENT__.querySelector('button#next'),
__SEARCH_INPUT__         = __DOCUMENT__.querySelector('input#query'),
__CURRENT_PAGE__         = __DOCUMENT__.querySelector('.limit'),
__TOTAL__                = __DOCUMENT__.querySelector('.total');

let entriesPerPage       = 10, // Количество записей на странице, по умолчанию 10
totalEntries             = 0, // Общее количество записей в массиве, который к нам пришел с "сервера", нужно чтобы показать информацию о количестве страниц в таблице
limit                    = 0, // С какого элемента начинать итерацию массива и перерисовывать таблицу (при клике на кнопки вперед и назад)
sortMethod               = 'default', // Сортировка, по дефолту - стандартная, при клике на заголовок таблицы в зависимости от количества кликов, ей присваевается нужное значение
sortLabel                = null, // Какой столбец мы сортируем
searchMode               = 0, // Режим поиска по дефолту не активирован
searchPhrase             = '', // И поисковая фраза тоже пустая
isFoundItems             = true; // Чтобы не отображалась ошибка, когда не надо

const getData = async () => {
    const response = await fetch('db.json');
    // Получаем данные
    let json = await response.json();
    // Если пользователь активировал режим поиска (ввел что-то в поле поиска),
    // ищем в массиве полученных данных обьекты, у которых в свойстве title хоть что-то совпало с тем,
    // что ввел пользователь
    if(searchMode !== 0 && searchPhrase !== '') {
      json = json.filter(function(elem) {
        return elem.title.toLowerCase().indexOf(searchPhrase.toLowerCase()) !== -1;
      });
      // Эта переменная нужна, чтобы в случае, если ничего не нашлось, выводить предупреждение
      isFoundItems = (json.length > 0);
    }
    // Разбиваем массив по количеству строк, выводимых на одну страницу
    let data = json.splice(limit, entriesPerPage);
    // Сортируем данные
    sortData(data, sortMethod, sortLabel, searchMode, searchPhrase);
    // Выводим информацию о текущей странице, и сколько их всего
    totalEntries = json.length;
    __TOTAL__.innerHTML = Math.ceil(json.length/10)+1;
    __CURRENT_PAGE__.innerHTML = (limit/10)+1;
}

// Функция сортировки
function sortData(data, sortMethod, sortLabel) {
  // Сначала создаем пустую переменную, куда в зависимости от метода сортировки будем складывать отсортированные item'ы
  let arr = [];
  // Смотрим, какой метод сортировки
  switch(sortMethod) {
   case 'asc':
     arr = data.sort(function(a, b) {
       if(sortLabel == 'price') {
         return a[sortLabel] - b[sortLabel];
       }
       if(sortLabel == 'id') {
         return a[sortLabel] - b[sortLabel];
       }
       else {
         let nameA = a[sortLabel].toLowerCase(), nameB = b[sortLabel].toLowerCase()
         if (nameA < nameB) //сортируем строки по возрастанию
           return -1
         if (nameA > nameB)
           return 1
       }
     });
   break;
   case 'desc':
   arr = data.sort(function(a, b) {
     if(sortLabel == 'price') {
       return b[sortLabel] - a[sortLabel];
     }
     if(sortLabel == 'id') {
       return b[sortLabel] - a[sortLabel];
     }
     else {
       let nameA = b[sortLabel].toLowerCase(), nameB = a[sortLabel].toLowerCase()
       if (nameA < nameB)
         return -1
       if (nameA > nameB)
         return 1
     }
   });
   break;
   // По дефолту (если стоит дефолтная сортировка, а соответственно sortLabel тоже не указан, по дефолту null)
   // оставляем все как есть
   case 'default':
     arr = data
   }
   // Строим таблицу по этим данным
   drawTable(arr);
}

// Функция отрисовки таблицы
function drawTable(arr) {
  // Сначала убираем предыдущие строки
   __TABLE__.innerHTML = '';
  // Строим таблицу в цикле
  for(let j = 0; j < arr.length; j++) {
    let newTableString = __DOCUMENT__.createElement("tr");
    newTableString.innerHTML = `<tr>
      <td data-label='id'>${arr[j].id}</td>
      <td data-label='title'>${arr[j].title}</td>
      <td data-label='price'>${arr[j].price}</td>
      <td data-label='color'>${arr[j].color}</td>
      <td data-label='department'>${arr[j].department}</td>
    </tr>`;
    __TABLE__.appendChild(newTableString);
    console.log(arr.length);
  }
  // А если ничего не найдено, выводим предупреждение
  if(!isFoundItems) {
    let newTableString = __DOCUMENT__.createElement("tr");
    newTableString.innerHTML = `<td>Sorrry, nothing found by your query.</td>`;
    __TABLE__.appendChild(newTableString);
  }
}

// Добавляем обработчики событий
function attachListeners() {
  // Обработчики для сортировки по клике на заголовки таблицы
  for(var i = 0; i < __TH_ARR__.length; i++) {
    __TH_ARR__[i].addEventListener('click', function(e) {
      sortLabel = this.getAttribute('data-label');
      console.log('You\'ve clicked on element th. His data-label attribute is ' + sortLabel);
      if(e.detail === 1) {
        sortMethod = 'asc';
      }
      if(e.detail === 2) {
        sortMethod = 'desc';
      }
      if(e.detail === 3) {
        sortMethod = 'default';
      }
      getData(limit);
    });
  }
  // Обработчики кнопок "Следующая страница" и "Предыдущая страница"
  __BACK_BUTTON__.addEventListener('click', function() {
    limit = (limit == 0) ? 0 : limit-entriesPerPage;
    getData();
  });
  __NEXT_BUTTON__.addEventListener('click', function() {
    limit = (limit >= totalEntries) ? totalEntries : limit+entriesPerPage;
    getData();
  });
  // Обработчик поля ввода
  __SEARCH_INPUT__.addEventListener('keyup', function() {
    searchMode = 1;
    limit = 0;
    searchPhrase = this.value;
    getData();
  })
}

// Получаем данные
getData();
// Вызываем функцию по установке обработчиков
attachListeners();
