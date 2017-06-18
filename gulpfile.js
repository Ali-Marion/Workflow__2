//Объявление переменных 
var gulp = require('gulp'),//подключение gulp
    connect = require('browser-sync'),//создание локального сервера
    minifyCSS = require('gulp-minify-css'),//минификация css-файла
    prefix = require('gulp-autoprefixer'),//добавление префиксов для устаревших браузеров
    sass = require('gulp-sass'),//компиляция sass-файла в css-файл
    uglify = require('gulp-uglify'),//минификация html-файла
	gulpIf = require('gulp-if'),//определение условий выборки	
	useref = require('gulp-useref'),//указание пути до созданных файлов, которые нужно подключить в html-документ (main.css и др.) 	
	clean = require('gulp-clean'),//удаление файлов и папок
    wiredep = require('wiredep').stream,//указание пути до файлов, которые мы указываем комментариями в html-документе(<!-- bower:css --> <!-- endbower -->)
	img = require('gulp-imagemin'),//подключение библиотеки для работы с изображениями
	png = require('imagemin-pngquant'),//подключение библиотеки для работы с png
	cache = require('gulp-cache'),//подключение библиотеки кеширования
	uncss = require('gulp-uncss'),//удаление неиспользуемых css-стилей
	sftp = require('gulp-sftp');//oтправка данных на сервер	

//Запуск локального сервера 
gulp.task('connect', function() {
  connect({server: { //определение параметров сервера
			baseDir: 'app' //корневая директория для сервера
		},
		notify: false //отключение уведомлений
	});
});

//Работа с sass
gulp.task('sass', function () {
  gulp.src('app/sass/*.sass')
    .pipe(sass())//компиляция Sass в CSS посредством gulp-sass
    .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'],{ cascade: true }))//добавление префиксов
    .pipe(gulp.dest('app/css/')) //папка, куда помещается итог предыдущих действий
    .pipe(connect.reload({stream: true}));
});

//Слежка за изменениями в файлах
gulp.task('watch', ['connect'],function () {
  gulp.watch('app/*.html', connect.reload);//наблюдение за HTML файлами в корне проекта
  gulp.watch('app/*/*.css', connect.reload);//наблюдение за css файлами в папке css
  gulp.watch('app/*/*.sass', ['sass']);//наблюдение за sass файлами и вызов таска sass
  gulp.watch('app/*/*.js', connect.reload);//наблюдение за JS файлами в папке js
  gulp.watch('bower.json', connect.reload);//наблюдение за bower файлами в папке bower
});

//Оптимизация фотографий
gulp.task('img', function() {
	return gulp.src('app/img/*')//выборка изображений из app
		.pipe(cache(img({  //сжатие их с наилучшими настройками с учетом кеширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [png()]
		})))
});

//Добавление ссылок на bower-файлы в html-документ
gulp.task('bower', function () {
  gulp.src('app/index.html')//путь до html-файла
    .pipe(wiredep({
        directory: "app/bower"//путь до папки bower, где файлы, которые мы хотим подключить к html-файлу
    }))
    .pipe(gulp.dest('app/'));//конечная папка
});

//Работа с uncss
gulp.task('uncss', function () {
  return gulp.src('app/css/*.css')
  .pipe(uncss({html: ['app/index.html']}))
  .pipe(gulp.dest('app/css'));
});

//Очистка папки dist
gulp.task('clear', function () {
    return gulp.src('dist', {read: false})
        .pipe(clean());
});
	
//Сборка проекта
gulp.task('build', ['clear', 'uncss', 'bower', 'img'], function () {
	gulp.src('app/fonts/**/*') //выборка шрифтов
		.pipe(gulp.dest('dist/fonts/'));//выгрузка шрифтов на продакшен
	gulp.src('app/img/**/*')//выборка изображений из app
		.pipe(gulp.dest('dist/img/'));//выгрузка изображений на продакшен
    return gulp.src('app/*.html')   
		.pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', minifyCSS()))
        .pipe(gulp.dest('dist'));
});		

//Отправка данных на сервер	
gulp.task('sftp', function () {
    return gulp.src('dist/*')
        .pipe(sftp({
            host: 'website.com',
            user: 'johndoe',
            pass: '1234'
        }));
});

//Задача по умолчанию 
gulp.task('default',['watch']);












