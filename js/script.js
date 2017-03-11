$(document).ready(function () {

    function createList(movies) {
        movies.map(function (movie) {
            var title = $('<div>').text(movie.title).addClass('movie-title');
            var id = movie.id;
            var poster = $('<img>').attr('src', movie.poster).addClass('movie-poster');
            $('<div>').appendTo('.movie-list').attr('data-id', id).append(poster).append(title).addClass('movie-list-item');
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
        });
    }

    function fetchRating() {
        $('.movie-list-item').on('click', function (e) {
            var id = $(this).attr('data-id');
            fetch('https://movie-ranking.herokuapp.com/movies/' + id + '/ratings')
                .then((resp) => resp.json())
                .then(function (data) {
                    let ratings = data;
                    let result = [];
                    console.log(ratings);
                    for (var i = 1; i <= 5; i++) {
                        var filtered = ratings.filter(function (movie) {
                            return movie.rating === i;
                        });
                        var frequency = filtered.length;
                        result.push(frequency);
                    }
                    showRating(result);
                })
                .catch(function () {
                    console.log('error2');
                })
        })
    }

    function showRating(ratings) {
        var ctx = $("#myChart"); //todo remove old chart
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [1, 2, 3, 4, 5],
                datasets: [{
                    label: '# of Votes',
                    data: ratings,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
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
