$(document).ready(function () {

    function createList(movies) {
        movies.map(function (movie) {
            var overlay = $('<div>').addClass('movie-list-item-overlay'),
                title = $('<div>').text(movie.title).addClass('movie-title'),
                id = movie.id,
                poster = $('<img>').attr('src', movie.poster).addClass('movie-poster'),
                averageRating = $('<p>').addClass('average-rating'),
                chart = $('<div>').addClass('my-chart'),
                starRating = $('<div>').html('<input type="radio" id="star5" name="star" value="5"><label for="star5"> Five Stars </label><input type="radio" id="star4" name="star" value="4"><label for="star4"> Four Stars </label><input type="radio" id="star3" name="star" value="3"><label for="star3"> Three Star </label><input type="radio" id="star2" name="star" value="2"><label for="star2"> Two Stars </label><input type="radio" id="star1" name="star" value="1"><label for="star1"> One Star </label>')
                .addClass('stars'),
                starDesc = $('<p>').text('Click to rate').addClass('stars-desc');
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

        ctx = $('#myChart' + id);
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

    function fetchMovies() {
        var movies;
        fetch('https://movie-ranking.herokuapp.com/movies')
            .then((resp) => resp.json())
            .then(function (data) {
                movies = data;
                createList(movies);
                sortMovies(movies);
                fetchRating();
            })
            .catch(function () {
                console.log('error');
            })
    }
    fetchMovies();
});