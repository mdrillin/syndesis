/*
 * Copyright (C) 2016 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.syndesis.test.itest.sheets;

import java.time.Duration;
import java.util.Arrays;

import com.consol.citrus.TestCaseRunner;
import com.consol.citrus.annotations.CitrusResource;
import com.consol.citrus.annotations.CitrusTest;
import io.syndesis.test.SyndesisTestEnvironment;
import io.syndesis.test.container.integration.SyndesisIntegrationRuntimeContainer;
import org.junit.ClassRule;
import org.junit.Test;
import org.springframework.http.HttpStatus;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;

import static com.consol.citrus.actions.ExecuteSQLAction.Builder.sql;
import static com.consol.citrus.http.actions.HttpActionBuilder.http;

/**
 * @author Christoph Deppisch
 */
public class MultiSqlToSheets_IT extends GoogleSheetsTestSupport {

    /**
     * Integration uses multiple data buckets for a data mapping. In this case mapper maps data from two SQL queries
     * and returns a contact list (first_name, company). This list is sent to Google Sheets API for appending the values
     * to a spreadsheet.
     */
    @ClassRule
    public static SyndesisIntegrationRuntimeContainer integrationContainer = new SyndesisIntegrationRuntimeContainer.Builder()
            .name("multi-sql-to-sheets")
            .fromExport(MultiSqlToSheets_IT.class.getResource("MultiSqlToSheets-export"))
            .customize("$..configuredProperties.schedulerExpression", "5000")
            .customize("$..rootUrl.defaultValue",
                        String.format("http://%s:%s", GenericContainer.INTERNAL_HOST_HOSTNAME, GOOGLE_SHEETS_SERVER_PORT))
            .build()
            .withNetwork(getSyndesisDb().getNetwork())
            .waitingFor(Wait.defaultWaitStrategy().withStartupTimeout(Duration.ofSeconds(SyndesisTestEnvironment.getContainerStartupTimeout())));

    @Test
    @CitrusTest
    public void testMultiSqlMapper(@CitrusResource TestCaseRunner runner) {
        cleanupDatabase(runner);

        runner.given(sql(sampleDb)
                .statements(Arrays.asList("insert into contact (first_name, last_name, company, lead_source) values ('Joe','Jackson','Red Hat','google-sheets')",
                                          "insert into contact (first_name, last_name, company, lead_source) values ('Joanne','Jackson','Red Hat','google-sheets')")));

        runner.when(http().server(googleSheetsApiServer)
                        .receive()
                        .post()
                        .payload("{\"majorDimension\":\"ROWS\",\"values\":[[\"Joe\",\"Red Hat\"],[\"Joanne\",\"Red Hat\"]]}"));

        runner.then(http().server(googleSheetsApiServer)
                        .send()
                        .response(HttpStatus.OK));
    }
}
