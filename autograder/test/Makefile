env: clean-env
	tar -czvf env.tar.gz -C env .

sample sample-bad: clean-submission
	tar -czvf submission.tar.gz -C $@ .

clean-docker:
	docker stop $(shell docker ps -aq) || docker rm $(shell docker ps -aq) || true

clean-%:
	rm $*.tar.gz 2> /dev/null || true

clean: clean-env clean-submission clean-docker
	
.PHONY: env sample sample-bad clean-% clean clean-docker
