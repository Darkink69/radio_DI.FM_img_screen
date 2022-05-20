"use strict";
// delete localStorage.favorite
// console.log(localStorage)
// let z = JSON.parse (localStorage.getItem ("favorite"))
// console.log(z[0].currentChannel.asset_url)

// let x = JSON.stringify(favorite)
// let y = JSON.parse(localStorage.favorite)
// console.log(y);  
  

const nameRadioStation = ['di', 'radiotunes', 'rockradio', 'zenradio', 'jazzradio', 'classicalradio'];
let numRadio = localStorage.numRadio;

const nameSitesRadio = [
    'https://www.di.fm/', 
    'https://www.radiotunes.com/', 
    'https://www.rockradio.com/', 
    'https://www.zenradio.com/', 
    'https://www.jazzradio.com/', 
    'https://www.classicalradio.com/'
];

// проверка, есть ли уже в localStorage данные о играющей станции. Если нет - выбираем случайную, если да - включаем последнюю.
if(localStorage.randomStation === true || localStorage.randomStation === undefined || localStorage.numRadio === undefined) {
    randomPortalRadio()
    localStorage.numRadio = numRadio;
}

// текущие треки для всех каналов одного сайта
let url_track = 'http://api.audioaddict.com/v1/' + nameRadioStation[numRadio] + '/track_history.json';

// вся информация о всех каналах одного сайта
let url_channel = 'http://api.audioaddict.com/v1/' + nameRadioStation[numRadio] + '/channels.json';



// Выводим на экран
viewCover();
tickTrackTime()
trackTime()
currentStartTimeTrack()

viewTitleArtist()
viewRadioInfo()
loadFavoriteTracks()
loadAPILastTrack()
// ViewFullImage()


// durationTrack()
// setTimePlay()

async function loadAPIDataTrack() { // загружаем данные всех треков портала
    try {
        let response = await fetch(url_track);
        let commits = await response.json(); 
        return commits;
    } catch {
        let div0 = document.createElement('div');
        document.body.prepend(div0);
        div0.innerHTML = 'Connection problem'
        
    }

}

async function idChannel() { // вычисляем id канала (случайно)
    let commits = await loadAPIDataTrack();
    let listIds = [];
    for(let i in commits) {
        listIds.push([i, commits[i]]);
    }
    var id_channel = localStorage.id_channel;
    // let id_channel = 1;

    if(localStorage.randomStation === true || localStorage.randomStation === undefined) {
        id_channel = listIds[Math.floor(Math.random() * listIds.length)][1].channel_id; // случайная станция

        localStorage.randomStation = false;
        localStorage.id_channel = id_channel;
        // console.log( localStorage.randomStation );

    } 
          
    return id_channel;
}

async function viewCover() { // выводим обложку канала
    let commits = await loadAPIDataTrack();
    let id_channel = await idChannel();
    document.getElementById('spinner').remove();
    document.getElementById('cover').src = 'https:' + commits[id_channel].art_url;
    document.getElementById('cover').hidden = false;      
}


async function setTimePlay() { // получаем дату начала и конца звучания трека
    let commits = await loadAPIDataTrack();
    let id_channel = await idChannel();
    let nowDate = new Date();

    let start_track = new Date(commits[id_channel].started * 1000);
    let end_track = new Date((commits[id_channel].started + commits[id_channel].duration) * 1000 );
    let lastSeconds = Math.floor(nowDate.getTime() / 1000) - commits[id_channel].started;
    let allSecondDuration = commits[id_channel].duration;
    // console.log(lastSeconds, 'осталось до конца')
    // console.log(start_track)
    // console.log(end_track)
    // console.log(allSecondDuration)

    return [start_track, end_track, lastSeconds, allSecondDuration];
};

async function trackTime() { // выводим время (часы, минуты, секунды) когда трек будет звучать, от и до
    let result = await setTimePlay();

    document.getElementById("time_play").innerHTML = addZero(result[0].getHours()) + ':' + addZero(result[0].getMinutes()) + ':' + addZero(result[0].getSeconds())
    + ' - '
    + addZero(result[1].getHours()) + ':' + addZero(result[1].getMinutes()) + ':' + addZero(result[1].getSeconds());
}

async function durationTrack() { // вычисляем продолжительность звучания трека, минуты и секунды
    let commits = await loadAPIDataTrack();
    let id_channel = await idChannel();
    let secondsDuration = commits[id_channel].duration % 60;
    let minutesDuration = Math.floor(commits[id_channel].duration / 60);
    
    return [addZero(minutesDuration) + ':' + addZero(secondsDuration)];
}

async function currentStartTimeTrack() { // вычисляем минуты и секунды с начала звучания трека
    let commits = await loadAPIDataTrack();
    let id_channel = await idChannel();
    let lastSeconds = await setTimePlay();
    
    let secondToEnd = commits[id_channel].duration - lastSeconds[2];
    // console.log(secondToEnd)
    let secondsPlay = lastSeconds[2] % 60;
    let minutesPlay = Math.floor(lastSeconds[2] / 60);
    if(secondsPlay < 10) secondsPlay = '0' + secondsPlay;
    if(minutesPlay < 10) minutesPlay = '0' + minutesPlay;

    return [minutesPlay, secondsPlay];

}




async function tickTrackTime() { // основной цикл показа времени звучания трека и прогресс бар
    let duration = await durationTrack();
    let last = await setTimePlay();
    let play = await currentStartTimeTrack();

    let minutesPlay = play[0];
    let secondsPlay = play[1];
    let lastSeconds = last[2];
    let secondToEnd = last[3] - lastSeconds;
    // console.log(lastSeconds)
    // console.log(secondToEnd)
    

    function tick() {
        let progressValue = lastSeconds / ((lastSeconds + secondToEnd) / 100);

        document.getElementById("time_track").innerHTML = minutesPlay + ':' + secondsPlay + ' / ' + duration;
        document.getElementById("progress").value = progressValue + ((lastSeconds + secondToEnd) / 100);


        secondToEnd--;
        secondsPlay = Number(secondsPlay) + 1;
        if(secondsPlay > 59) {
            minutesPlay = Number(minutesPlay) + 1;
            if(Number(minutesPlay) < 10) minutesPlay = '0' + minutesPlay;
            secondsPlay = 0;
            
        }
        if(Number(secondsPlay) < 10) secondsPlay = '0' + secondsPlay;

        if(secondToEnd <= -9) {
            location.reload();
            
            // viewCover();
            // tickTrackTime()
            // trackTime()
            // currentStartTimeTrack()
        }

        setTimeout(tick, 1000);
    }
    
    tick();
    


}

async function viewTitleArtist() { // Выводим исполнителя и название трека
    let commits = await loadAPIDataTrack();
    let id_channel = await idChannel();

    document.getElementById("displayArtist").innerHTML = commits[id_channel].display_artist;
    document.getElementById("displayTrack").innerHTML = commits[id_channel].display_title;
}

function randomPortalRadio() { // случайный выбор портала с радиостанциями из списка
    numRadio = Math.floor(Math.random() * nameRadioStation.length);
    return numRadio;
}

async function loadChannelData() { // ищем данные о текущей радиостанции (канале)
    let response_channel = await fetch(url_channel);
    let id_channel = await idChannel();
    let commits_channel = await response_channel.json();

    let currentChannel;
    let listIdsChannel = [];
        for(let i in commits_channel) {
            listIdsChannel.push([i, commits_channel[i]]);
            if(listIdsChannel[i][1].id == id_channel) currentChannel = listIdsChannel[i][1];
        }
        return currentChannel;

}   

async function viewRadioInfo() { // выводим инфо о текущей радиостанции (название, ссылку, короткое описание, портал)
    let currentChannel = await loadChannelData();

    document.getElementById('nameRadioStation').innerHTML = currentChannel.name;
    document.getElementById('description_short').innerHTML = currentChannel.description_short;
    document.getElementById('linkToChannel').href = nameSitesRadio[numRadio] + currentChannel.key;
    document.getElementById('cover_channel').src = 'https:' + currentChannel.asset_url;
    // console.log(currentChannel.key)
}

async function loadAPILastTrack() { // выводим ранее игравшие треки
    let id_channel = await idChannel();
    let url_last_tracks = 'http://api.audioaddict.com/v1/' + nameRadioStation[numRadio] + '/track_history/channel/' + id_channel + '.json';
    let responseLastTracks = await fetch(url_last_tracks);
    let commitsLastTracks = await responseLastTracks.json();

    let numLastImg = 9; // (9 - включая текущий) количество последних треков (в json больше нет)

    for(let i=1; i < numLastImg; i++) {
        let div = document.createElement('div');
        if(i % 2 == 0) {
            div.className = 'last2';
        } else {
            div.className = 'last';
        }
              
        document.getElementById('last_list').append(div);

        let lastTime = document.createElement('div');
        div.append(lastTime);
        lastTime.classList = 'last_time_id';
        let lastTimePlayed = (new Date(commitsLastTracks[i].started * 1000));
        lastTime.innerHTML = addZero(lastTimePlayed.getHours()) + ':' + addZero(lastTimePlayed.getMinutes());


        let lastTrackCover = document.createElement('img');
        
        lastTrackCover.classList = 'lastId';
        lastTrackCover.id = 'lastId' + i;
        lastTrackCover.src = 'https:' + commitsLastTracks[i].art_url;
        lastTrackCover.setAttribute('onclick', 'ViewFullImage(this)');

        div.append(lastTrackCover);

        let lastTrack = document.createElement('p');
        div.append(lastTrack);
        lastTrack.innerHTML = commitsLastTracks[i].track;
        lastTrack.classList = 'last_track_id';

    }
}

async function loadFavoriteTracks() { // Загружаем все каналы, добавленные в Фаворит
    
    let currentChannel = await loadChannelData();
    let id_channel = await idChannel();

    try {
        var favorite = JSON.parse(localStorage.favorite);

        for (let i=1; i < favorite.length; i++) {
            let favoriteChannelCover = document.createElement('img');
            let divFavorite = document.createElement('div');
            divFavorite.id = favorite[i].currentChannel.key;
            let favoriteTitle = document.createElement('p');

            document.getElementById('all_favorite').append(divFavorite);
            divFavorite.classList = 'favoriteChannel';
            favoriteChannelCover.id = favorite[i].currentChannel.key;
            divFavorite.append(favoriteChannelCover);
            divFavorite.append(favoriteTitle);

            favoriteChannelCover.src = 'https:' + favorite[i].currentChannel.asset_url;
            favoriteChannelCover.style = 'width: 50px;'
            favoriteTitle.innerHTML = favorite[i].currentChannel.name;
            favoriteChannelCover.setAttribute('onclick', 'loadFavoriteChannel(this)');
            // console.log(currentChannel.key)
            if (favorite[i].currentChannel.key == currentChannel.key) {
                document.getElementById('removeFavorite').hidden = false;
                document.getElementById('addFavorite').hidden = true;
            }
            
        } 
    } catch {}


}

function loadFavoriteChannel() { // переход на другую станцию из Фаворитов
    var favorite = JSON.parse(localStorage.favorite);
    
    document.getElementById(event.target.id).addEventListener('click', () => {
        for (let i=0; i < favorite.length; i++) {
            if (favorite[i].id == event.target.id) {
                localStorage.numRadio = favorite[i].numRadio;
                localStorage.id_channel = favorite[i].id_channel;
                location.reload();
            }
        }
        
    });
}

function newRandomStation() {
    delete localStorage.id_channel;
    delete localStorage.numRadio;
    delete localStorage.randomStation;
    // localStorage.randomStation = true;
    location.reload();
}

async function nextChannel() { // переключаем станции по-порядку вперед или назад
    let id_channel = await idChannel();
    let currentChannel = await loadChannelData();
    let commits = await loadAPIDataTrack();

    document.getElementById('nextChannel').addEventListener('click', () => {
        let next = 1;
        console.log(next)
        console.log(event.target.id)
    });

    document.getElementById('prevChannel').addEventListener('click', () => {
        let next = 0;
        console.log(next)
    });

    
    try {
        let listIds = [];
        for(let i in commits) {
            listIds.push([i, commits[i]]);
        }

        console.log(document.getElementById('nextChannel').id)
        listIds.forEach((item, index, array) => {
            if (item[1].channel_id == id_channel) {
                localStorage.id_channel = array[index + 1][0];
                location.reload();
            }
        });



    } catch {}



    console.log(currentChannel.key, id_channel)

}


function ViewFullImage() { // показываем обложку крупно на модальном окне

    const layer = document.getElementById('layer');
    document.getElementById(event.target.id).addEventListener('click', () => {
        layer.style.display = 'block';
        document.getElementById('cover_full').src = document.getElementById(event.target.id).getAttribute('src');
        document.getElementById('cover_full').style = 'width: 700px';
    });
    layer.addEventListener('click', (e) => {
        // if (e.target === layer) {
            layer.style.display = 'none';
        // }
    });
    // console.log(document.documentElement.clientWidth, document.documentElement.clientHeight)
    
}

async function searchStation() { // поиск радиостанции по всем порталам
    document.getElementById('spinner_search').hidden = false;
    let resultsSearch = [];
    result.innerHTML = input.value;
    let currentSearch = result.innerHTML.toLowerCase().split(' ');
    
    for (let radio=0; radio < nameRadioStation.length; radio++) {
        let url_channel = 'http://api.audioaddict.com/v1/' + nameRadioStation[radio] + '/channels.json';
        let response_channel = await fetch(url_channel);
        let id_channel = await idChannel();
        let commits_channel = await response_channel.json();

        
        for(let i in commits_channel) {
            for(let j in i) {
                if (commits_channel[i].name.toLowerCase().split(' ')[j] == currentSearch[0] || commits_channel[i].key == result.innerHTML) {
                    commits_channel[i].premium_id = radio; // вписываем индекс портала
                    resultsSearch.push(commits_channel[i]);
                }

            }
        }

    }
    // console.log(resultsSearch)

    // показываем результаты поиска

    try {
        document.getElementById('divResultSearchAll').remove()
    } catch {}

    document.getElementById('spinner_search').hidden = true;
    let divResultSearchAll = document.createElement('div');
    let x = document.getElementById('search');
    document.getElementById('searchDiv').append(divResultSearchAll);
    divResultSearchAll.id = 'divResultSearchAll';

    if(resultsSearch.length == 0) {
        let divResultSearch = document.createElement('div');
        let searchTitle = document.createElement('p');
        divResultSearchAll.append(divResultSearch);
        divResultSearch.append(searchTitle);
        searchTitle.innerHTML = 'No results';

    }

    for(let i in resultsSearch) {
        let divResultSearch = document.createElement('div');
        let searchChannelCover = document.createElement('img');
        let searchTitle = document.createElement('p');
        divResultSearchAll.append(divResultSearch);
        divResultSearch.id = resultsSearch[i].key;
        divResultSearch.className = 'favoriteChannel';
        divResultSearch.append(searchChannelCover);
        divResultSearch.append(searchTitle);
        searchTitle.innerHTML = resultsSearch[i].name;
        searchTitle.style = 'color: black';
        searchChannelCover.src = 'https:' + resultsSearch[i].asset_url;
        searchChannelCover.style = 'width: 50px'
        searchChannelCover.id = resultsSearch[i].premium_id + '' + resultsSearch[i].id
        searchChannelCover.setAttribute('onclick', 'loadSearchedChannel(this)');

    }
    
}

// input.onchange = function() {
//         result.innerHTML = input.value;
//         console.log(result.innerHTML)
// };
function addZero(num) { // добавляет 0 перед цифрой во всех таймерах, если она меньше 10
    if (num < 10) return '0' + num;
    else return num;
}


function loadSearchedChannel() { // загружаем станцию, выбранную в поиске
    // console.log('!!', event.target.id[0], event.target.id.slice(1))
    document.getElementById(event.target.id).addEventListener('click', () => {

        localStorage.numRadio = event.target.id[0];
        localStorage.id_channel = event.target.id.slice(1);
        location.reload();


        
    });
}



async function addToFavorite() { // добавление в Фавориты, картинка, название, ссылка на загрузку этой станции

    let currentChannel = await loadChannelData();
    let id_channel = await idChannel();

    let favoriteChannelCover = document.createElement('img');
    let divFavorite = document.createElement('div');
    divFavorite.setAttribute('id', currentChannel.key);
    let favoriteTitle = document.createElement('p');

    document.getElementById('all_favorite').append(divFavorite);
    divFavorite.classList = 'favoriteChannel';
    // favoriteChannelCover.id = currentChannel.name;
    divFavorite.append(favoriteChannelCover);
    divFavorite.append(favoriteTitle);
    favoriteChannelCover.setAttribute('onclick', 'loadFavoriteChannel(this)');

    favoriteChannelCover.src = 'https:' + currentChannel.asset_url;
    favoriteChannelCover.style = 'width: 50px;'
    favoriteTitle.innerHTML = currentChannel.name;
    document.getElementById('addFavorite').hidden = true;
    document.getElementById('removeFavorite').hidden = false;

    // запись в localStorage
    try {
        var favorite = JSON.parse(localStorage.favorite);
    } catch {
        var favorite = [
            {   id: currentChannel.key, 
                currentChannel: currentChannel,
                numRadio: numRadio,
                id_channel: id_channel,
            }
        ];
    }
    

    let obj = {};
    obj.id = currentChannel.key;
    obj.currentChannel = currentChannel;
    obj.numRadio = numRadio;
    obj.id_channel = id_channel;
    
    favorite.push(obj);
    // console.log(favorite)

    localStorage.favorite = JSON.stringify(favorite);
}

async function removeFavorite() { // удаляем из Фаворитов
    let currentChannel = await loadChannelData();
    
    var favorite = JSON.parse(localStorage.favorite);
    // console.log(favorite)
    for (let i=1; i < favorite.length; i++) {
        if (favorite[i].id == currentChannel.key) {
            favorite.splice(i, 1);
            // console.log(favorite)
            localStorage.favorite = JSON.stringify(favorite);
        
        }
        
    };
    // console.log(currentChannel.key)
    document.getElementById(currentChannel.key).remove();
    document.getElementById('removeFavorite').hidden = true;
    document.getElementById('addFavorite').hidden = false;

}

cover.addEventListener('click', () => {
    ViewFullImage();
    console.log(event.target);
});

// ViewFullImage();

cover.onmouseover = function() {
    cover.classList.add('animate');
    cover.classList.remove('animate2');

    let ended = false;

    cover.addEventListener('transitionend', function() {
        if (!ended) {
            ended = true;
            cover.classList.add('animate2');
        }
        
    });
    // console.log(event.screenX, event.screenY)
}

// cover_channel.onmouseover = function() {
//     cover_channel.src = 'img/play.svg';
//     cover_channel.hidden = "false";
// }

document.getElementById('rec').setAttribute('style', 'fill: red;'); 



// TODO 
//      Сделать кнопку назад
//      При окончании трека дождаться обновления в json и тоьлко потом прорисовывать (или что за глюк?)
//      Разобраться почему показ обложек крупно не срабатывает с 1 клика
//      Показ обложек в мобильной версии

//      Перезагрузка отдельных блоков без перезагрузки всей страницы    
//      Кнопка плей на превьюшке радио при наведении
//      Заглушку на отсутствующие картинки

//      Улучшать поиск, добавить кнопку интер и тд.
//      Полная инфа о станции
//      Переключение по порядку в пределах портала(?)
//      Подумать над "скретчем пластинки"
//      Чб лого при оффлайне?
//      Ссылка на плейлист на Spotify?
//      Подсказка в поиске
//      Собственный веитинг на загрузке обложки (вертушка?)
//      Поиск каждого трека в Spotify?
//      При переходе на вкладку обновить страницу? (все отстает)