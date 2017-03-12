$(document).ready(function () {

    function createList(movies) {
        movies.map(function (movie) {
            var overlay = $('<div>').addClass('movie-list-item-overlay'),
                title = $('<div>').text(movie.title).addClass('movie-title'),
                id = movie.id,
                poster = $('<img>').attr('src', movie.poster).addClass('movie-poster'),
                averageRating = $('<p>').addClass('average-rating'),
                chart = $('<div>').addClass('my-chart'),
                starList = $('<ul>').attr('id', 'stars').attr('data-selector', 'star' + id),
                starRating = $('<div>').addClass('rating-stars').append(starList),
                starDesc = $('<p>').text('Click to rate').addClass('stars-desc');
            for (var i = 1; i <= 5; i++) {
                var star = $('<li>').addClass('star').attr('data-value', i).html('<span class="fa">★</span>');
                starList.append(star);
            }
            overlay.append(title).append(averageRating).append(chart).append(starRating).append(starDesc);
            $('<div>').appendTo('.movie-list').attr('data-id', id).append(poster).append(overlay).addClass('movie-list-item');
        });
        $('.sort-button').fadeIn(500);
    }

    function sortMovies(movies) {
        $('#sortButton').on('click', function (e) {
            $(this).toggleClass('ascending');
            if (!$(this).hasClass('ascending')) {
                $(this).text('A-Z ↓');
                movies.sort(function (a, b) {
                    if (b.title < a.title)
                        return -1;
                    if (b.title > a.title)
                        return 1;
                    return 0;
                })
            } else {
                $(this).text('A-Z ↑');
                movies.sort(function (a, b) {
                    if (a.title < b.title)
                        return -1;
                    if (a.title > b.title)
                        return 1;
                    return 0;
                })
            }
            $('.movie-list-item').remove();
            createList(movies);
            fetchRating();
        });
    }

    function fetchRating() {
        $('.movie-list-item').on('click', function (e) {
            var id = $(this).attr('data-id');
            fetch('https://movie-ranking.herokuapp.com/movies/' + id + '/ratings')
                .then((resp) => resp.json())
                .then(function (data) {
                    showRating(data);
                    addRating();
                })
                .catch(function () {
                    console.log('error2');
                })
        })
    }

    function getFrequency(ratings) {
        var result = [];
        for (var i = 1; i <= 5; i++) { //todo wydzielic funkcje
            var filtered = ratings.filter(function (movie) {
                return movie.rating === i;
            });
            var frequency = filtered.length;
            result.push(frequency);
        }
        return result;
    }

    function getAverage(ratings) {
        var addedRatings = 0;
        ratings.map(function (rating) {
            addedRatings += rating.rating;
        })
        averageRating = (addedRatings / ratings.length).toFixed(1);
        return averageRating;
    }

    function showRating(ratings) {
        var frequency = getFrequency(ratings),
            id = ratings[0].movie_id,
            averageRating = getAverage(ratings),
            overlay = $("[data-id='" + id + "']").find('.movie-list-item-overlay'),
            chartCanvas = $('<canvas>').attr('id', 'myChart' + id).addClass('my-chart-canvas'),
            chart = $("[data-id='" + id + "']").find('.my-chart').append(chartCanvas),
            ctx,
            myChart;

        $('body').on('click', function () {
            $('.my-chart').empty();
            $('.movie-list-item-overlay').fadeOut(500);
        })

        overlay.fadeIn(500);
        chart.fadeIn(500);

        overlay.find('.average-rating').html('<span class="icon">★ </span>' + averageRating + '/5</span>').addClass('average-rating');

        ctx = $('#myChart' + id); //tofo do wydzielenia
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['1 star', '2 stars', '3 stars', '4 stars', '5 stars'],
                datasets: [{
                    label: '# of Votes',
                    data: frequency,
                    backgroundColor: [
                        'rgba(255, 255, 255, .7)',
                        'rgba(255, 255, 255, .7)',
                        'rgba(255, 255, 255, .7)',
                        'rgba(255, 255, 255, .7)',
                        'rgba(255, 255, 255, .7)'
                    ]
                }]
            },
            options: {
                legend: {
                    display: false
                },
                scales: {
                    yAxes: [{
                        display: false
                    }]
                }
            }
        });
    }


    function starHover() {
        $('#stars li').on('mouseover', function () {
            var onStar = parseInt($(this).data('value'), 10); 
            $(this).parent().children('li.star').each(function (e) {
                if (e < onStar) {
                    $(this).addClass('hover');
                } else {
                    $(this).removeClass('hover');
                }
            });
        }).on('mouseout', function () {
            $(this).parent().children('li.star').each(function (e) {
                $(this).removeClass('hover');
            });
        });
    }


    function addRating() {
        $('#stars li').on('click', function (e) {
            e.stopPropagation();
            var ratingValue;
            var id = $(this).closest('.movie-list-item').attr('data-id');
            var onStar = parseInt($(this).data('value'), 10);
            var stars = $(this).parent().children('li.star');
            for (i = 0; i < stars.length; i++) {
                $(stars[i]).removeClass('selected');
            }
            for (i = 0; i < onStar; i++) {
                $(stars[i]).addClass('selected');
            }
            ratingValue = $('#stars li.selected').last().attr('data-value');
            var data = {
                "rating": ratingValue
            }
            var request = new Request('https://movie-ranking.herokuapp.com/movies/' + id + '/ratings', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            })
            fetch(request)
                .then(function () {
                    console.log('success');
                });
        })
    }

    function fetchMovies() {
        var movies;
        fetch('https://movie-ranking.herokuapp.com/movies')
            .then((resp) => resp.json())
            .then(function (data) {
                movies = data;
                createList(movies);
                sortMovies(movies);
                starHover();
                fetchRating();
            })
            .catch(function () {
                console.log('error');
            })
    }
    fetchMovies();
});