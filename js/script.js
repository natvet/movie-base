$(document).ready(function () {

    function createList(movies) {
        movies.map(function (movie) {
            var title = $('<div>').text(movie.title).addClass('movie-title'),
                id = movie.id,
                poster = $('<img>').attr('src', movie.poster).addClass('movie-poster'),
                chart = $('<div>').addClass('my-chart');
            $('<div>').appendTo('.movie-list').attr('data-id', id).append(poster).append(title).append(chart).addClass('movie-list-item');
        });
    }

    function sortMovies(movies) {
        $('#sortButton').on('click', function (e) {
            $(this).toggleClass('ascending');
            if (!$(this).hasClass('ascending')) {
                $(this).text('A-Z');
                movies.sort(function (a, b) {
                    if (b.title < a.title)
                        return -1;
                    if (b.title > a.title)
                        return 1;
                    return 0;
                })
            } else {
                $(this).text('Z-A');
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

    function showRating(ratings) {
        $('.my-chart').fadeOut(500);
        $('.my-chart').empty();
        var result = [],
            id = ratings[0].movie_id,
            addedRatings = 0,
            averageRating,
            chartCanvas = $('<canvas>').attr('id', 'myChart' + id).addClass('my-chart-canvas'),
            chart = $("[data-id='" + id + "']").find('.my-chart').append(chartCanvas),
            ctx,
            myChart;
        chart.fadeIn(500);

        for (var i = 1; i <= 5; i++) {
            var filtered = ratings.filter(function (movie) {
                return movie.rating === i;
            });
            var frequency = filtered.length;
            result.push(frequency);
        }

        ratings.map(function (rating) {
            addedRatings += rating.rating;
        })
        averageRating = (addedRatings / ratings.length).toFixed(1);
        $('<p>').text(averageRating + '/5').addClass('average-rating').appendTo(chart);
        chart.append('<button class="rate-button" data-selector="rate-button">Rate</button>');
        ctx = $('#myChart' + id);
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['1 star', '2 stars', '3 stars', '4 stars', '5 stars'],
                datasets: [{
                    label: '# of Votes',
                    data: result,
                    backgroundColor: [
                        '#ffffff',
                        '#ffffff',
                        '#ffffff',
                        '#ffffff',
                        '#ffffff'
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