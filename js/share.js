function index_render(data){

    // var head = new Vue({
    //     el: 'head',
    //     data:data.head
    // });

    var header = new Vue({
        el: 'header',
        data:data.header,
        mounted: function () {
            this.$nextTick(function () {
                $('#nav').slicknav({
                    'label' : '',
                    'prependTo': '.mobile-menu',

                });
            })
        }
    });
    var footer = new Vue({
        el: 'footer',
        data:data
    });
}

function audio_render(data){

    var player_container = new Vue({
        el: '#container-audio',
        data:{
            box_state:true,
            play_state:0, // 0 pause 1 play
            play_mode:0, // 0顺序 1随机 2单曲循环
            current_song_name:'',
            current_song_singer:'',
            current_song:0,
            current_time:0.0,
            tag_current_time:'00:00',
            total_time:1.0,
            tag_total_time: '00:00',
            progress_btn_state:false,
            path:data.path,
            songs:data.songs,
            player:document.getElementById('player')
        },
        watch:{
            current_time: function (val, oldVal) {
                this.tag_current_time = this.format_time(val)
            },
            total_time: function (val, oldVal) {
                this.tag_total_time = this.format_time(val)
            }
        },
        methods: {
            show_or_hide:function(event){
                event.stopPropagation();
                if(this.box_state)
                {
                    $('#btn-box-control svg').attr('data-icon','chevron-up');
                }
                else{
                    $('#btn-box-control svg').attr('data-icon','chevron-down');
                }
                this.box_state = !this.box_state;
                $('#audio-box').slideToggle();
            },
            play_or_stop: function (event) {
                if(this.play_state === 0)
                {
                    $('#btn-control svg').attr('data-icon','pause-circle');
                    this.player.play();
                }
                else{
                    $('#btn-control svg').attr('data-icon','play-circle');
                    this.player.pause();
                }
                this.play_state = 1 - this.play_state;
            },
            next_or_pre: function (move) {
                songs_num = this.songs.length;
                if(this.play_mode === 0)
                {
                    while(true){
                        this.current_song = (this.current_song + move) % songs_num;
                        if(this.current_song < 0){
                            this.current_song = songs_num - 1;
                        }
                        if((this.songs[this.current_song]).hasOwnProperty('file')){
                            break;
                        }
                    }

                }else if(this.play_mode === 1){
                    while(true) {
                        this.current_song = Math.floor(Math.random() * songs_num);
                        if((this.songs[this.current_song]).hasOwnProperty('file')){
                            break;
                        }
                    }
                }
                $('#btn-control svg').attr('data-icon','pause-circle');
                this.play_state = 1;
                this.update_song_information(this.songs[this.current_song]);
                this.player.play();
            },
            play_song:function(index){
                this.current_song = index;
                $('#btn-control svg').attr('data-icon','pause-circle');
                this.play_state = 1;
                this.update_song_information(this.songs[this.current_song]);
                this.player.play();
            },
            change_mode:function () {
                this.play_mode = (this.play_mode + 1) % 3;
                let icon_class = '';
                if(this.play_mode === 0){
                    icon_class = 'list';
                }else if(this.play_mode === 1){
                    icon_class = 'random';
                }else{
                    icon_class = 'retweet';
                }
                $('#icon-play-mode').attr('data-icon',icon_class);
            },
            update_song_information:function (song) {
                this.player.setAttribute('src',this.path + song.file);
                this.player.load();
                this.current_song_name = song.name;
                this.current_song_singer = song.singer;
                // this.total_time = this.player.duration;
            },
            update_current_time:function () {
                if(this.play_state === 1){
                    this.current_time = this.player.currentTime;
                    if(!this.progress_btn_state){
                        var per = Math.floor(this.player.currentTime / this.player.duration * 1000) / 10 + '%';
                        $('#progress-current').css('width', per);
                    }
                }
            },
            set_volume:function(event){
                offset_left = $('#progress-volume').offset().left;
                length_progress = $('#progress-volume').width();
                dx = event.clientX - offset_left;
                var per = Math.max(Math.min(Math.floor(dx / length_progress * 1000) / 10, 100.0), 0.0) + '%';
                $('#progress-current-volume').css('width', per);
                this.player.volume = Math.max(Math.min(Math.floor(dx / length_progress * 100) / 100, 100.0), 0.0);

            },
            format_time(sec){
                return (Math.floor(sec / 60) / 100).toFixed(2).slice(-2) + ":" + (sec % 60 / 100).toFixed(2).slice(-2)
            }
        },
        mounted: function () {
            this.$nextTick(function () {
                this.player.volume = 0.5;
                this.player.oncanplay = function () {
                    player_container.total_time = player_container.player.duration;
                };
                this.player.addEventListener('ended',function () {
                    player_container.next_or_pre(1);
                });
                i = 0;
                while(1){
                    if((this.songs[i]).hasOwnProperty('file'))
                    {
                        this.update_song_information(this.songs[i]);
                        break;
                    }
                    i++;
                }
                $('#btn-progress').mousedown(function(e1) {
                    player_container.progress_btn_state = true;
                    offset_left = $('#container-progress').offset().left;
                    length_progress = $('#container-progress').width();
                    document.onmousemove = function(e2) {
                        e2 = e2 || window.event;
                        dx = e2.clientX - offset_left;
                        var per = Math.max(Math.min(Math.floor(dx / length_progress * 1000) / 10, 100.0), 0.0) + '%';
                        $('#progress-current').css('width', per);
                    };
                    document.onmouseup = function (e3) {
                        if(player_container.progress_btn_state){
                            document.onmousemove = null;
                            dx = e3.pageX - offset_left;
                            per = Math.max(Math.min(Math.floor(dx / length_progress * 1000) / 1000, 1.00), 0.00);
                            new_time = per * player_container.player.duration;
                            player_container.player.currentTime = new_time;
                            player_container.current_time = new_time;
                            player_container.progress_btn_state = false;
                        }

                    };
                });
                setInterval(function () {
                    player_container.update_current_time();
                }, 1000);
                // times = data.counter;
                // counter = setInterval(function () {
                //     times--;
                //     if(times < 0){
                //         $('#btn-box-control').click();
                //         $('#btn-box-control').show();
                //         $('#player-note').hide();
                //         player_container.player.muted = false;
                //         $('#btn-control').click();
                //         clearInterval(counter);
                //     }else{
                //         $('#count-time').html(times);
                //     }
                // }, 1000);
            })
        }
    });

    var song_container = new Vue({
        el: '#container',
        data:{
            songs:data.songs,
            title:data.title,
            intro:data.intro,
            message:data.message,
            current_song:-1
        },
        methods: {
        },
        mounted: function () {
            this.$nextTick(function () {
                $('#table-song').bootstrapTable({
                    pagination: true,
                    pageSize:20,
                });
                $('#table-song tr').bind('mouseover', function (el) {
                    id = (this.id).split('-')[1];
                    $('#btn-play-' + id).css('opacity', 1.0);
                    $('#song-' + id).css('background-color','#42bc7f26');
                });
                $('#table-song tr').bind('mouseleave', function (el) {
                    id = (this.id).split('-')[1];
                    $('#btn-play-' + id).css('opacity', 0.0);
                    if(song_container.current_song !== parseInt(id)){
                        $('#song-' + id).css('background-color','');
                    }
                });
                $('.table-play-icon').bind('click',function (e1) {
                    $('#song-' + song_container.current_song).css('background-color','');
                    id = (this.id).split('-')[2];
                    song_container.current_song = parseInt(id);
                    $('#song-' + id).css('background-color','#42bc7f26');
                    player_container.play_song(parseInt(id));
                })
            })
        }
    });
}

function loadJSON(callback, url) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function init(func, url) {
    loadJSON(function(response) {
        var actual_JSON = JSON.parse(response);
        // console.log(actual_JSON);
        func(actual_JSON);
    }, url);
}

init(index_render,'data/data.json');
init(audio_render,'data/songs.json');


