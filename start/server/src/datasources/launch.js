const { RESTDataSource } = require('apollo-datasource-rest');

// Connect a REST API
class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://api.spacexdata.com/v2/';
  }
  // Write data-fetching methods
  async getAllLaunches() {
    const response = await this.get('launches');
    return Array.isArray(response)
      ? response.map(launch => this.launchReducer(launch))
      : [];
  }
  // REST API로부터 받은 launch data를 schema type에 맞게 정형화
  launchReducer(launch) {
    return {
      id: launch.flight_number || 0,
      cursor: `${launch.launch_date_unix}`,
      site: launch.launch_site && launch.launch_site.site_name,
      mission: {
        name: launch.mission_name,
        missionPatchSmall: launch.links.mission_patch_small,
        missionPatchLarge: launch.links.mission_patch,
      },
      rocket: {
        id: launch.rocket.rocket_id,
        name: launch.rocket.rocket_name,
        type: launch.rocket.rocket_type,
      },
    };
  }
  // TODO: 왜 여기만 async 있는지. 아래에 ids에는 없는데.
  async getLaunchById({ launchId }) {
    const response = await this.get('launches', { flight_number: launchId });
    return this.launchReducer(response[0]);
  }
  
  getLaunchesByIds({ launchIds }) {
    return Promise.all(
      launchIds.map(launchId => this.getLaunchById({ launchId })),
    );
  }
}



module.exports = LaunchAPI;