const { get_stats_for_last_x_weeks } = require('./contest_player_list_with_all_stats');

function stats_for_last_x_weeks_with_analysis (field, weeks) {
    let arr = get_stats_for_last_x_weeks(field, weeks);
    return fieldStatList(arr);
}
function fieldStatList (field) {
    return field.reduce((stat_obj, player) => {
            player.stats.forEach(stat => {
                stat.stats.forEach(indStat => {
                    indStat.tourn_id = stat.tournament_id;
                    if (! stat_obj[indStat.statId]) {
                        stat_obj[indStat.statId] = {
                            stat_name: indStat.name,
                            players_with_this_stat: {
                                [player.pga_id]: [indStat]
                            },
                            total_in_field: 1
                        };
                    } else {
                        let x = stat_obj[indStat.statId].players_with_this_stat[player.pga_id];
                        if (x) {
                            x.push(indStat);
                        } else {
                            stat_obj[indStat.statId].players_with_this_stat[player.pga_id] = [indStat];
                            stat_obj[indStat.statId].total_in_field ++;
                        }
                    }
                });
            });
            return stat_obj;
    }, {});
}
module.exports = {stats_for_last_x_weeks_with_analysis};