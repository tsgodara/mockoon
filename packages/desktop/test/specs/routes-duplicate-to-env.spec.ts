import { resolve } from 'path';
import contextMenu from '../libs/context-menu';
import dialogs from '../libs/dialogs';
import environments from '../libs/environments';
import headersUtils from '../libs/headers-utils';
import modals from '../libs/modals';
import navigation from '../libs/navigation';
import routes from '../libs/routes';
import utils from '../libs/utils';

describe('Duplicate a route to an environment', async () => {
  const envNameSelector =
    '.modal-content .modal-body .list-group .list-group-item:first-child div:first-of-type';
  const envHostnameSelector =
    '.modal-content .modal-body .list-group .list-group-item:first-child div:last-of-type';

  it('should open the environment', async () => {
    await environments.open('basic-data');
  });

  it('should assert that menu entry is disabled when only one environment present', async () => {
    await contextMenu.assertEntryDisabled('routes', 3, 2);
  });

  it('should add a new environment and assert that menu entry is enabled', async () => {
    await dialogs.save(resolve('./tmp/storage/new-env-test.json'));
    await environments.add();
    await environments.select(1);

    await contextMenu.assertEntryDisabled('routes', 3, 2, true);
  });

  it("should open duplication modal and verify selected route's information on modal", async () => {
    await contextMenu.click('routes', 3, 2);

    await modals.assertExists();

    const targetRoute = await $('.modal-content .modal-title small').getText();

    expect(targetRoute).toContain('POST /dolphins');

    await utils.assertElementText($(envNameSelector), 'New env test');
    await utils.assertElementText($(envHostnameSelector), '0.0.0.0:3001/');
  });

  it('should duplicate selected route to selected environment', async () => {
    await $(envNameSelector).click();
    await routes.assertActiveMenuEntryText('POST\n/dolphins');

    await navigation.switchView('ENV_SETTINGS');
    await environments.assertActiveMenuEntryText('New env test');
  });

  it('should duplicate selected route with the same properties', async () => {
    await navigation.switchView('ENV_ROUTES');

    await routes.assertMethod('POST');
    await routes.assertPath('dolphins');

    await routes.switchTab('HEADERS');

    await headersUtils.assertHeadersValues('route-response-headers', {
      'Content-Type': 'application/json'
    });
  });
});
